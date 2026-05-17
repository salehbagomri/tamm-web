import { createServerClient } from '@/lib/supabase/server'
import type { Order, OrderItem } from '@/lib/types/order'

function mapOrder(raw: any): Order {
  return {
    id: raw.id,
    orderNumber: raw.order_number,
    customerId: raw.customer_id,
    orderType: raw.order_type,
    status: raw.status,
    totalAmount: raw.total_amount,
    address: raw.address,
    preferredDate: raw.preferred_date,
    preferredTimeSlot: raw.preferred_time_slot,
    notes: raw.notes,
    includeInstallation: raw.include_installation,
    createdAt: raw.created_at,
    items: raw.items?.map((item: any): OrderItem => ({
      id: item.id,
      orderId: item.order_id,
      itemType: item.product_id ? 'product' : 'service',
      productId: item.product_id,
      serviceTypeId: item.service_type_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.unit_price * item.quantity,
      product: item.product,
      service: item.service,
      includeInstallation: item.include_installation
    })) || [],
    customerProfile: raw.customerProfile || null,
    technicianName: raw.technician_name,
    technicianNotes: raw.technician_notes,
    scheduledPeriod: raw.scheduled_period,
    scheduledHour: raw.scheduled_hour,
    quotePrice: raw.quote_price,
    quoteDetails: raw.quote_details,
    quoteDuration: raw.quote_duration,
    quoteStatus: raw.quote_status,
    quoteSentAt: raw.quote_sent_at,
    quoteRespondedAt: raw.quote_responded_at,
    rejectionReason: raw.rejection_reason,
    quoteAttachmentUrl: raw.quote_attachment_url,
    paymentType: raw.payment_type ?? 'cash',
    paymentMethodId: raw.payment_method_id ?? null,
    city: raw.city ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
  }
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:products (*),
          service:service_types (*)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as any[]).map(mapOrder)
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }
}

export async function getOrderById(orderId: string, customerId: string): Promise<Order | null> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:products (*),
          service:service_types (*)
        )
      `)
      .eq('id', orderId)
      .eq('customer_id', customerId)
      .single()

    if (error) throw error
    return data ? mapOrder(data) : null
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    return null
  }
}

export async function getActiveOrders(customerId: string): Promise<Order[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:products (*),
          service:service_types (*)
        )
      `)
      .eq('customer_id', customerId)
      .in('status', ['pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as any[]).map(mapOrder)
  } catch (error) {
    console.error('Error fetching active orders:', error)
    return []
  }
}
