'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(
  orderId: string,
  technicianId: string | null,
  rating: number,
  comment: string | null
): Promise<{ success: boolean; error?: string }> {
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'يجب اختيار تقييم من 1 إلى 5 نجوم' }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'يجب تسجيل الدخول أولاً' }

  const { error } = await supabase.from('reviews').insert({
    order_id: orderId,
    customer_id: user.id,
    technician_id: technicianId,
    rating,
    comment: comment || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'لقد قمت بتقييم هذا الطلب مسبقاً' }
    }
    return { success: false, error: 'حدث خطأ أثناء حفظ التقييم، يرجى المحاولة مرة أخرى' }
  }

  revalidatePath('/orders/' + orderId)
  return { success: true }
}
