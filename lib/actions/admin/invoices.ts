'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { getAdminOrderById } from '@/lib/data/admin/orders'
import { generateInvoicePDF } from '@/lib/utils/pdf-generator'

export type InvoiceData = {
  id: string
  invoiceNumber: string
  orderId: string
  customerId: string
  subtotal: number
  installationFee: number
  totalAmount: number
  paymentType: string
  pdfUrl: string | null
  issuedAt: string
  createdAt: string
}

function mapInvoice(row: any): InvoiceData {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    orderId: row.order_id,
    customerId: row.customer_id,
    subtotal: Number(row.subtotal),
    installationFee: Number(row.installation_fee),
    totalAmount: Number(row.total_amount),
    paymentType: row.payment_type,
    pdfUrl: row.pdf_url ?? null,
    issuedAt: row.issued_at,
    createdAt: row.created_at
  }
}

/**
 * الحصول على الفاتورة الخاصة بطلب معين إذا كانت موجودة
 */
export async function getInvoiceByOrderId(orderId: string): Promise<InvoiceData | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()

    if (error || !data) return null
    return mapInvoice(data)
  } catch (err) {
    console.error('[getInvoiceByOrderId] error:', err)
    return null
  }
}

/**
 * إنشاء فاتورة لطلب مكتمل (رتبة المدير العام/النظام) — توليد PDF + رفع لـ Storage + حفظ في DB
 */
export async function createInvoiceForOrderAdmin(orderId: string): Promise<{ invoice?: InvoiceData; error?: string }> {
  try {
    const adminClient = createAdminClient()

    // التحقق من وجود فاتورة سابقة للطلب باستخدام adminClient لتجاوز RLS
    const { data: existingData, error: existingErr } = await adminClient
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existingData) {
      return { invoice: mapInvoice(existingData) }
    }

    // جلب بيانات الطلب وتفاصيله باستخدام adminClient
    const order = await getAdminOrderById(orderId, adminClient)
    if (!order) {
      return { error: 'الطلب غير موجود' }
    }

    // حساب المجموع الفرعي ورسوم التركيب
    let subtotal = 0
    let installationFee = 0

    order.items.forEach(item => {
      const quantity = item.quantity ?? 1
      const unitPrice = item.unitPrice ?? 0
      const itemTotal = item.totalPrice ?? (unitPrice * quantity)
      
      const baseTotal = unitPrice * quantity
      const installPart = Math.max(0, itemTotal - baseTotal)

      subtotal += baseTotal
      installationFee += installPart
    })

    // إذا كانت الفاتورة لخدمة لا تحتوي على منتجات فالمجموع الفرعي هو قيمة الخدمة
    if (subtotal === 0 && order.totalAmount > 0) {
      subtotal = order.totalAmount
      installationFee = 0
    }

    const totalAmount = order.totalAmount

    // توليد الرقم التسلسلي للفاتورة: INV-YYYY-NNNN
    const year = new Date().getFullYear()

    // البحث عن أعلى رقم فاتورة للسنة الحالية لتجنب التكرار
    const { data: latestInvoices, error: latestErr } = await adminClient
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `INV-${year}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    if (latestErr) {
      console.error('[createInvoiceForOrderAdmin] latest invoice error:', latestErr.message)
    }

    let nextSerial = 1
    if (latestInvoices && latestInvoices.length > 0) {
      const latestNum = latestInvoices[0].invoice_number
      const match = latestNum.match(/INV-\d{4}-(\d+)/)
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1
      }
    }

    const serialNum = String(nextSerial).padStart(4, '0')
    const invoiceNumber = `INV-${year}-${serialNum}`

    // تاريخ الإصدار بالتنسيق المطلوب
    const now = new Date()
    const issuedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`

    // ─── توليد PDF ──────────────────────────────────────────────────────
    let pdfUrl: string | null = `/orders/${orderId}/invoice` // fallback

    try {
      const pdfBuffer = generateInvoicePDF({
        invoiceNumber,
        orderNumber: order.orderNumber ?? orderId.substring(0, 8),
        customerName: order.customerProfile?.fullName ?? 'عميل',
        customerPhone: order.customerProfile?.phone ?? null,
        customerAddress: order.address ?? null,
        items: order.items.map(item => ({
          name: item.product?.name ?? item.service?.name ?? 'عنصر',
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice ?? 0,
          totalPrice: item.totalPrice ?? 0,
          includeInstallation: item.includeInstallation ?? false,
        })),
        subtotal,
        installationFee,
        totalAmount,
        paymentType: order.paymentType ?? 'cash',
        issuedAt: `${issuedDate}م`,
        deliveryFee: 0,
      })

      // رفع PDF إلى Supabase Storage
      const fileName = `invoice-${invoiceNumber}.pdf`
      const { error: uploadErr } = await adminClient.storage
        .from('receipts')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (uploadErr) {
        console.error('[createInvoiceForOrderAdmin] upload error:', uploadErr.message)
      } else {
        const { data: urlData } = adminClient.storage.from('receipts').getPublicUrl(fileName)
        pdfUrl = urlData.publicUrl
        console.log('[Invoice PDF] ✅ uploaded:', pdfUrl)
      }
    } catch (pdfErr) {
      console.error('[createInvoiceForOrderAdmin] PDF generation error:', pdfErr)
      // نستمر حتى لو فشل توليد الـ PDF — الفاتورة التفاعلية تبقى متاحة
    }

    // إدراج الفاتورة في قاعدة البيانات
    const { data: newInvoice, error: insertErr } = await adminClient
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: orderId,
        customer_id: order.customerId,
        subtotal,
        installation_fee: installationFee,
        total_amount: totalAmount,
        payment_type: order.paymentType,
        pdf_url: pdfUrl,
      })
      .select('*')
      .single()

    if (insertErr) {
      console.error('[createInvoiceForOrderAdmin] insert error:', insertErr.message)
      return { error: 'فشل إدراج الفاتورة في قاعدة البيانات' }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/orders/${orderId}`)

    return { invoice: mapInvoice(newInvoice) }
  } catch (err: any) {
    console.error('[createInvoiceForOrderAdmin] Server error:', err)
    return { error: 'حدث خطأ غير متوقع أثناء توليد الفاتورة' }
  }
}

/**
 * إنشاء فاتورة لطلب مكتمل — للمدراء مع التحقق من الصلاحيات
 */
export async function createInvoiceForOrder(orderId: string): Promise<{ invoice?: InvoiceData; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح للوصول' }

    // تحقق من صلاحية المدير
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'manager') {
      return { error: 'عذراً، هذه العملية متاحة للمدير فقط' }
    }

    return createInvoiceForOrderAdmin(orderId)
  } catch (err: any) {
    console.error('[createInvoiceForOrder] Server error:', err)
    return { error: 'حدث خطأ غير متوقع أثناء توليد الفاتورة' }
  }
}
