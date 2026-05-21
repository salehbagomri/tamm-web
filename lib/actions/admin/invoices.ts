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
 * إنشاء فاتورة لطلب مكتمل — توليد PDF + رفع لـ Storage + حفظ في DB
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

    // التحقق من وجود فاتورة سابقة للطلب
    const existing = await getInvoiceByOrderId(orderId)
    if (existing) {
      return { invoice: existing }
    }

    // جلب بيانات الطلب وتفاصيله
    const order = await getAdminOrderById(orderId)
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
    const adminClient = createAdminClient()

    // حساب عدد فواتير السنة الحالية
    const { count, error: countErr } = await adminClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01T00:00:00Z`)

    if (countErr) {
      console.error('[createInvoiceForOrder] count error:', countErr.message)
    }

    const serialNum = String((count ?? 0) + 1).padStart(4, '0')
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
        console.error('[createInvoiceForOrder] upload error:', uploadErr.message)
      } else {
        const { data: urlData } = adminClient.storage.from('receipts').getPublicUrl(fileName)
        pdfUrl = urlData.publicUrl
        console.log('[Invoice PDF] ✅ uploaded:', pdfUrl)
      }
    } catch (pdfErr) {
      console.error('[createInvoiceForOrder] PDF generation error:', pdfErr)
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
      console.error('[createInvoiceForOrder] insert error:', insertErr.message)
      return { error: 'فشل إدراج الفاتورة في قاعدة البيانات' }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/orders/${orderId}`)

    return { invoice: mapInvoice(newInvoice) }
  } catch (err: any) {
    console.error('[createInvoiceForOrder] Server error:', err)
    return { error: 'حدث خطأ غير متوقع أثناء توليد الفاتورة' }
  }
}
