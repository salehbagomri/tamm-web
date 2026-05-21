import { NextResponse } from 'next/server'
import { createInvoiceForOrderAdmin } from '@/lib/actions/admin/invoices'
import { calculateCommissionForOrder } from '@/lib/actions/admin/commissions'

export async function POST(request: Request) {
  try {
    // 1. التحقق من سرية الهوك لحماية المسار
    const secretHeader = request.headers.get('x-webhook-secret')
    const localSecret = process.env.SUPABASE_WEBHOOK_SECRET

    if (!localSecret || secretHeader !== localSecret) {
      console.warn('[Webhook] محاولة وصول غير مصرح بها أو إعدادات السرية مفقودة')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. تحليل محتوى الطلب (Supabase Trigger Payload)
    const payload = await request.json()
    const { type, table, record, old_record } = payload

    console.log(`[Webhook] تم استلام هوك لجدول: ${table} من نوع: ${type}`)

    if (table !== 'orders') {
      return NextResponse.json({ message: 'Table not supported' }, { status: 200 })
    }

    // 3. التحقق من انتقال حالة الطلب إلى 'completed'
    const isCompleted = record?.status === 'completed'
    const wasAlreadyCompleted = old_record?.status === 'completed'

    if (isCompleted && !wasAlreadyCompleted) {
      const orderId = record.id
      console.log(`[Webhook] معالجة الطلب المكتمل: ${orderId}`)

      // تشغيل توليد الفاتورة بصلاحيات المسؤول
      const invoiceResult = await createInvoiceForOrderAdmin(orderId)
      if (invoiceResult.error) {
        console.error(`[Webhook] خطأ أثناء إنشاء الفاتورة للطلب ${orderId}:`, invoiceResult.error)
      } else {
        console.log(`[Webhook] تم إنشاء الفاتورة بنجاح للطلب: ${orderId}`)
      }

      // تشغيل حساب عمولة الفني
      const commissionResult = await calculateCommissionForOrder(orderId)
      if (commissionResult.error) {
        console.error(`[Webhook] خطأ أثناء حساب العمولة للطلب ${orderId}:`, commissionResult.error)
      } else {
        console.log(`[Webhook] تم حساب وتسجيل العمولة بنجاح للطلب: ${orderId}`)
      }

      return NextResponse.json({
        success: true,
        orderId,
        invoiceCreated: !invoiceResult.error,
        commissionCalculated: !commissionResult.error,
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      message: 'No actions performed (order status not transitioning to completed)',
    }, { status: 200 })
  } catch (err: any) {
    console.error('[Webhook Error]:', err.message || err)
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
  }
}
