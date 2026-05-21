'use server'

import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notifyManagers } from '@/lib/actions/notifications'

export interface CheckoutData {
  address: string
  phone: string
  notes: string
  preferredDate: string
  preferredTimeSlot: string
  city: string
  latitude: number | null
  longitude: number | null
}

export interface BookingData {
  address: string
  phone: string
  notes: string
  preferredDate: string
  preferredTimeSlot: string
}

export interface QuoteData {
  serviceCategory: string
  description: string
  address: string
  phone: string
  preferredDate: string
}

interface CartItemInput {
  id: string
  price: number | null
  installationPrice: number
  includeInstallation: boolean
  quantity: number
  isPriceOnRequest: boolean
}

type ActionResult = { error: string } | { orderNumber: string; orderId?: string }

// توليد رقم طلب فريد
function generateOrderNumber(): string {
  return `TM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
}

// التحقق المبكر من توفر الكمية — يُستدعى من صفحة السلة قبل الانتقال للدفع
export async function validateCartStock(
  cartItems: { id: string; quantity: number; name: string }[]
): Promise<{ error?: string }> {
  const adminClient = createAdminClient()
  const productIds = cartItems.map(item => item.id)
  const { data: stockData, error: stockErr } = await adminClient
    .from('products')
    .select('id, name, stock_quantity')
    .in('id', productIds)

  if (stockErr || !stockData) return { error: 'فشل التحقق من توفر المنتجات' }

  for (const item of cartItems) {
    const product = stockData.find(p => p.id === item.id)
    if (!product) return { error: `المنتج "${item.name}" غير موجود في النظام` }
    if (product.stock_quantity < item.quantity) {
      return { error: `الكمية المطلوبة من "${product.name}" غير متوفرة. المتوفر: ${product.stock_quantity} قطعة فقط` }
    }
  }

  return {}
}

// إنشاء طلب منتجات من السلة
export async function createProductOrder(
  cartItems: CartItemInput[],
  checkoutData: CheckoutData,
  paymentType: 'cash' | 'bank' | 'wallet' = 'cash',
  paymentMethodId: string | null = null
): Promise<ActionResult> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  // ─── التحقق من توفر الكمية قبل إنشاء الطلب ─────────────────────
  const adminClient = createAdminClient()
  const productIds = cartItems.map(item => item.id)
  const { data: stockData, error: stockErr } = await adminClient
    .from('products')
    .select('id, name, stock_quantity')
    .in('id', productIds)

  if (stockErr || !stockData) return { error: 'فشل التحقق من توفر المنتجات' }

  for (const item of cartItems) {
    const product = stockData.find(p => p.id === item.id)
    if (!product) return { error: `المنتج غير موجود في النظام` }
    if (product.stock_quantity < item.quantity) {
      return { error: `الكمية المطلوبة من "${product.name}" غير متوفرة. المتوفر: ${product.stock_quantity} قطعة فقط` }
    }
  }
  // ───────────────────────────────────────────────────────────────────

  const totalAmount = cartItems.reduce((sum, item) => {
    if (item.isPriceOnRequest) return sum
    const base = (item.price ?? 0) + (item.includeInstallation ? item.installationPrice : 0)
    return sum + base * item.quantity
  }, 0)

  const orderNumber = generateOrderNumber()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      order_type: 'product',
      status: 'pending',
      total_amount: totalAmount,
      address: checkoutData.address,
      contact_phone: checkoutData.phone,
      preferred_date: checkoutData.preferredDate || null,
      preferred_time_slot: checkoutData.preferredTimeSlot || null,
      notes: checkoutData.notes || null,
      payment_type: paymentType,
      payment_method_id: paymentMethodId,
      city: checkoutData.city || null,
      latitude: checkoutData.latitude ?? null,
      longitude: checkoutData.longitude ?? null,
    })
    .select('id, order_number')
    .single()

  if (orderErr || !order) return { error: 'حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى' }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    item_type: 'product',
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price ?? 0,
    total_price: ((item.price ?? 0) + (item.includeInstallation ? item.installationPrice : 0)) * item.quantity,
    include_installation: item.includeInstallation ?? false,
  }))

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
  if (itemsErr) {
    console.error('[order_items insert error]', JSON.stringify(itemsErr, null, 2))
    return { error: `حدث خطأ أثناء حفظ المنتجات: ${itemsErr.message}` }
  }

  // ─── خصم الكمية من المخزون + تنبيهات ────────────────────────────
  try {
    for (const item of cartItems) {
      const product = stockData.find(p => p.id === item.id)!
      const newQty = product.stock_quantity - item.quantity

      const updateData: Record<string, unknown> = { stock_quantity: newQty }
      // إخفاء تلقائي إذا وصلت الكمية للصفر
      const { data: prodFull } = await adminClient.from('products').select('auto_hide_when_out, low_stock_threshold, name').eq('id', item.id).single()
      if (newQty <= 0 && prodFull?.auto_hide_when_out) {
        updateData.is_available = false
      }

      await adminClient.from('products').update(updateData).eq('id', item.id)

      // إشعار المدير عند انخفاض المخزون
      const threshold = prodFull?.low_stock_threshold ?? 3
      if (newQty <= threshold && newQty > 0) {
        await notifyManagers({
          title: '⚠️ تنبيه مخزون منخفض',
          body: `المنتج "${prodFull?.name}" وصل لـ ${newQty} قطعة فقط!`,
          type: 'low_stock',
          orderId: order.id,
        })
      } else if (newQty <= 0) {
        await notifyManagers({
          title: '🔴 نفاد مخزون',
          body: `المنتج "${prodFull?.name}" نفد بالكامل وتم إخفاؤه تلقائياً من المتجر.`,
          type: 'out_of_stock',
          orderId: order.id,
        })
      }
    }
  } catch (err) {
    console.error('[stock deduction error]', err)
  }
  // ───────────────────────────────────────────────────────────────────

  // إرسال إشعار للمديرين بطلب جديد
  try {
    await notifyManagers({
      title: 'طلب منتجات جديد',
      body: `تم تقديم طلب منتجات جديد رقم #${order.order_number}`,
      type: 'new_order',
      orderId: order.id,
    })
  } catch (err) {
    console.error('[createProductOrder notification error]', err)
  }

  revalidatePath('/orders')
  return { orderNumber: order.order_number as string, orderId: order.id as string }
}

// إنشاء طلب خدمة
export async function createServiceOrder(
  serviceId: string,
  serviceName: string,
  basePrice: number,
  isQuoteBased: boolean,
  bookingData: BookingData
): Promise<ActionResult> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const orderNumber = generateOrderNumber()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      order_type: isQuoteBased ? 'quote_request' : 'service',
      status: 'pending',
      total_amount: isQuoteBased ? 0 : basePrice,
      address: bookingData.address,
      contact_phone: bookingData.phone,
      preferred_date: bookingData.preferredDate || null,
      preferred_time_slot: bookingData.preferredTimeSlot || null,
      notes: bookingData.notes || null,
      quote_status: isQuoteBased ? 'pending' : null,
    })
    .select('id, order_number')
    .single()

  if (orderErr || !order) return { error: 'حدث خطأ أثناء إنشاء الحجز' }

  await supabase.from('order_items').insert({
    order_id: order.id,
    item_type: 'service',
    service_type_id: serviceId,
    quantity: 1,
    unit_price: basePrice,
    total_price: basePrice,
    include_installation: false,
  })

  // إرسال إشعار للمديرين بطلب خدمة أو طلب عرض سعر جديد
  try {
    const isQuote = isQuoteBased
    await notifyManagers({
      title: isQuote ? 'طلب عرض سعر جديد' : 'طلب خدمة جديد',
      body: isQuote 
        ? `طلب عرض سعر جديد للخدمة (${serviceName}) رقم #${order.order_number}`
        : `تم تقديم طلب خدمة (${serviceName}) جديد رقم #${order.order_number}`,
      type: isQuote ? 'new_quote_request' : 'new_order',
      orderId: order.id,
    })
  } catch (err) {
    console.error('[createServiceOrder notification error]', err)
  }

  revalidatePath('/orders')
  return { orderNumber: order.order_number as string }
}

// إنشاء طلب عرض سعر
export async function createQuoteRequest(quoteData: QuoteData): Promise<ActionResult> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const orderNumber = generateOrderNumber()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      order_type: 'quote_request',
      status: 'pending',
      total_amount: 0,
      address: quoteData.address,
      contact_phone: quoteData.phone,
      preferred_date: quoteData.preferredDate || null,
      notes: `الفئة: ${quoteData.serviceCategory}\n${quoteData.description}`,
      quote_status: 'pending',
    })
    .select('id, order_number')
    .single()

  if (orderErr || !order) return { error: 'حدث خطأ أثناء إرسال الطلب' }

  // إرسال إشعار للمديرين بطلب عرض سعر مخصص جديد
  try {
    await notifyManagers({
      title: 'طلب عرض سعر جديد',
      body: `تم تقديم طلب عرض سعر مخصص جديد رقم #${order.order_number}`,
      type: 'new_quote_request',
      orderId: order.id,
    })
  } catch (err) {
    console.error('[createQuoteRequest notification error]', err)
  }

  return { orderNumber: order.order_number as string }
}

// رد العميل على عرض السعر
export async function respondToQuote(
  orderId: string,
  response: 'accepted' | 'rejected',
  rejectionReason?: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

  const { data: order } = await supabase
    .from('orders')
    .select('id, quote_status, order_number')
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .single()

  if (!order) return { error: 'الطلب غير موجود' }
  if (order.quote_status !== 'sent') return { error: 'لا يمكن الرد على هذا العرض' }

  const updates: any = {
    quote_status: response,
    quote_responded_at: new Date().toISOString(),
    // عند القبول يصبح الطلب مؤكداً، وعند الرفض يُلغى
    status: response === 'accepted' ? 'confirmed' : 'cancelled',
  }
  if (response === 'rejected' && rejectionReason) {
    updates.rejection_reason = rejectionReason
  }

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)

  if (error) return { error: 'حدث خطأ أثناء حفظ الرد' }

  // إرسال إشعار للمديرين برد العميل على عرض السعر
  try {
    await notifyManagers({
      title: 'رد على عرض السعر',
      body: `قام العميل بالرد بـ (${response === 'accepted' ? 'القبول' : 'الرفض'}) على عرض السعر للطلب رقم #${order.order_number}`,
      type: 'quote_response',
      orderId,
    })
  } catch (err) {
    console.error('[respondToQuote notification error]', err)
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)

  return {}
}

export async function updateReceiptUrl(
  orderId: string,
  receiptUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' }

  const { data: orderRow, error: dbError } = await supabase
    .from('orders')
    .update({ receipt_url: receiptUrl })
    .eq('id', orderId)
    .select('id, order_number')
    .maybeSingle()

  if (dbError) return { success: false, error: dbError.message }

  // Notify manager using service-role client (bypasses RLS on profiles)
  try {
    const admin = createAdminClient()
    const { data: manager } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'manager')
      .limit(1)
      .maybeSingle()

    if (manager?.id) {
      await admin.from('notifications').insert({
        user_id: manager.id,
        title: 'سند تحويل جديد',
        body: `قام العميل بإرفاق سند التحويل للطلب #${orderRow?.order_number ?? orderId}`,
        type: 'payment_receipt',
        order_id: orderId,
        is_read: false,
      })
    }
  } catch {
    // Notification failure must not block the receipt save
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
