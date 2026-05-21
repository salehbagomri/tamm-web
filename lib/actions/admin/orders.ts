'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/lib/types/order'
import { sendNotification } from '@/lib/actions/notifications'

const STATUS_ARABIC: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  assigned: 'تم تعيين فني',
  on_the_way: 'الفني في الطريق',
  in_progress: 'قيد العمل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

// ─── revalidate helper ────────────────────────────────────────────────────────

function revalidateAll(orderId?: string) {
  revalidatePath('/admin/orders')
  revalidatePath('/admin/quotes')
  revalidatePath('/admin/dashboard')
  if (orderId) revalidatePath(`/admin/orders/${orderId}`)
}

// ─── تحديث حالة الطلب ───────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    console.error('[updateOrderStatus]', error)
    return { error: 'فشل تحديث حالة الطلب' }
  }

  // ─── توليد فاتورة تلقائياً عند إتمام الطلب ───────────────────────────
  if (status === 'completed') {
    try {
      const { createInvoiceForOrder } = await import('@/lib/actions/admin/invoices')
      await createInvoiceForOrder(orderId)
    } catch (err) {
      console.error('[invoice generation on completion failed]', err)
    }
  }

  // ─── إرجاع الكمية عند إلغاء الطلب ─────────────────────────────
  if (status === 'cancelled') {
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)
        .eq('item_type', 'product')

      if (items && items.length > 0) {
        for (const item of items) {
          if (!item.product_id) continue

          // جلب الكمية الحالية
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity, auto_hide_when_out, is_available')
            .eq('id', item.product_id)
            .single()

          if (product) {
            const newQty = product.stock_quantity + item.quantity
            const updateData: Record<string, unknown> = { stock_quantity: newQty }

            // إعادة إظهار المنتج إذا كان مخفياً بسبب نفاد الكمية
            if (!product.is_available && product.auto_hide_when_out && newQty > 0) {
              updateData.is_available = true
            }

            await supabase.from('products').update(updateData).eq('id', item.product_id)
          }
        }
      }
    } catch (err) {
      console.error('[stock restoration on cancel]', err)
    }
  }
  // ───────────────────────────────────────────────────────────────────

  // إرسال إشعار للعميل
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, order_number')
      .eq('id', orderId)
      .single()

    if (order?.customer_id) {
      const statusAr = STATUS_ARABIC[status] || status
      await sendNotification({
        userId: order.customer_id,
        title: 'تحديث حالة الطلب',
        body: `تم تحديث حالة طلبك #${order.order_number} إلى (${statusAr})`,
        type: 'order_update',
        notificationType: `order_${status}`,
        orderId,
      })
    }
  } catch (err) {
    console.error('[updateOrderStatus notification error]', err)
  }

  revalidateAll(orderId)
  return {}
}

// ─── تعيين الفني ─────────────────────────────────────────────────────────────

export async function assignTechnician(
  orderId: string,
  technicianId: string,
  managerNotes?: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    // حذف التعيين القديم إن وجد
    await supabase.from('assignments').delete().eq('order_id', orderId)

    // إنشاء تعيين جديد
    const { error: assignErr } = await supabase.from('assignments').insert({
      order_id: orderId,
      technician_id: technicianId,
      assigned_by: user.id,
      status: 'assigned',
      manager_notes: managerNotes || null,
    })

    if (assignErr) return { error: 'فشل تعيين الفني' }

    // تحديث الحالة إلى assigned
    const { error: statusErr } = await supabase
      .from('orders')
      .update({ status: 'assigned', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (statusErr) return { error: 'تم تعيين الفني لكن فشل تحديث الحالة' }

    // إرسال إشعار للعميل
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, order_number')
        .eq('id', orderId)
        .single()

      if (order?.customer_id) {
        await sendNotification({
          userId: order.customer_id,
          title: 'تم تعيين فني لطلبك',
          body: `تم تعيين فني للبدء في طلبك رقم #${order.order_number}`,
          type: 'order_update',
          notificationType: 'technician_assigned',
          orderId,
        })
      }
    } catch (err) {
      console.error('[assignTechnician notification error]', err)
    }

    revalidateAll(orderId)
    return {}
  } catch (err) {
    return { error: 'فشل تعيين الفني' }
  }
}

// ─── جدولة الطلب ─────────────────────────────────────────────────────────────

export async function scheduleOrder(
  orderId: string,
  scheduledPeriod: string,
  scheduledHour: string
): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('orders')
    .update({
      scheduled_period: scheduledPeriod,
      scheduled_hour: scheduledHour,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    console.error('[scheduleOrder]', error)
    return { error: 'فشل حفظ موعد الجدولة' }
  }

  revalidateAll(orderId)
  return {}
}

// ─── إرسال عرض السعر ─────────────────────────────────────────────────────────

export type QuoteData = {
  quotePrice: number
  quoteDetails: string
  quoteDuration: string
  quoteAttachmentUrl?: string | null
}

export async function sendQuote(
  orderId: string,
  quoteData: QuoteData
): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('orders')
    .update({
      quote_price: quoteData.quotePrice,
      quote_details: quoteData.quoteDetails,
      quote_duration: quoteData.quoteDuration,
      quote_attachment_url: quoteData.quoteAttachmentUrl ?? null,
      quote_status: 'sent',
      quote_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    console.error('[sendQuote]', error)
    return { error: 'فشل إرسال عرض السعر' }
  }

  // إرسال إشعار للعميل
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, order_number')
      .eq('id', orderId)
      .single()

    if (order?.customer_id) {
      await sendNotification({
        userId: order.customer_id,
        title: 'عرض سعر جديد',
        body: `تم إعداد وإرسال عرض السعر لطلبك رقم #${order.order_number}`,
        type: 'quote_sent',
        notificationType: 'quote_sent',
        orderId,
      })
    }
  } catch (err) {
    console.error('[sendQuote notification error]', err)
  }

  revalidateAll(orderId)
  return {}
}

// ─── رفع مرفق عرض السعر ──────────────────────────────────────────────────────

export async function uploadQuoteAttachment(
  formData: FormData,
  orderId: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient()
  const file = formData.get('file') as File | null

  if (!file) return { error: 'لم يتم اختيار ملف' }
  if (file.size > 10 * 1024 * 1024) return { error: 'حجم الملف يجب أن يكون أقل من 10 ميجا' }

  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  if (!allowed.includes(file.type)) return { error: 'نوع الملف غير مسموح — PDF أو صورة فقط' }

  const ext = file.name.split('.').pop() ?? 'pdf'
  const filename = `${orderId}-${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('quote-attachments')
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (uploadErr) {
    console.error('[uploadQuoteAttachment]', uploadErr)
    return { error: 'فشل رفع الملف' }
  }

  const { data } = supabase.storage.from('quote-attachments').getPublicUrl(filename)
  return { url: data.publicUrl }
}
