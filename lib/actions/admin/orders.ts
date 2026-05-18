'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/lib/types/order'

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

  revalidateAll(orderId)
  return {}
}

// ─── تعيين الفني ─────────────────────────────────────────────────────────────

export async function assignTechnician(
  orderId: string,
  technicianId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth user:', JSON.stringify({ userId: user?.id, authError }))
    if (!user) return { error: 'يجب تسجيل الدخول أولاً' }

    // حذف التعيين القديم إن وجد
    const { error: deleteErr } = await supabase.from('assignments').delete().eq('order_id', orderId)
    console.log('Delete result:', JSON.stringify({ deleteErr }))

    // إنشاء تعيين جديد
    console.log('INSERT payload:', JSON.stringify({
      order_id: orderId,
      technician_id: technicianId,
      assigned_by: user?.id,
      status: 'pending',
    }))
    const { error: assignErr } = await supabase.from('assignments').insert({
      order_id: orderId,
      technician_id: technicianId,
      assigned_by: user.id,
      status: 'pending',
    })

    if (assignErr) {
      console.error('assignErr:', JSON.stringify(assignErr))
      return { error: 'فشل تعيين الفني' }
    }

    // تحديث الحالة إلى assigned
    const { error: statusErr } = await supabase
      .from('orders')
      .update({ status: 'assigned', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (statusErr) {
      console.error('statusErr:', JSON.stringify(statusErr))
      return { error: 'تم تعيين الفني لكن فشل تحديث الحالة' }
    }

    revalidateAll(orderId)
    return {}
  } catch (err) {
    console.error('assignTechnician CATCH:', err)
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
