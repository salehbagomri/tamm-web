import type { SupabaseClient } from '@supabase/supabase-js'

export type Review = {
  id: string
  orderId: string
  customerId: string
  technicianId: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export async function getReviewByOrderId(
  supabase: SupabaseClient,
  orderId: string
): Promise<Review | null> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('order_id', orderId)
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    orderId: data.order_id,
    customerId: data.customer_id,
    technicianId: data.technician_id ?? null,
    rating: data.rating,
    comment: data.comment ?? null,
    createdAt: data.created_at,
  }
}
