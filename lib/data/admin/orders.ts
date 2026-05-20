import { createServerClient } from '@/lib/supabase/server'
import type { Order, OrderStatus, OrderType } from '@/lib/types/order'

// ─── أنواع مساعدة ────────────────────────────────────────────────────────────

export type AdminOrderFilters = {
  status?: OrderStatus | 'all'
  order_type?: OrderType | 'all'
  search?: string
  page?: number
  limit?: number
}

export type AdminOrderRow = {
  id: string
  orderNumber: string
  orderType: OrderType
  status: OrderStatus
  totalAmount: number
  address: string
  preferredDate: string | null
  preferredTimeSlot: string | null
  notes: string | null
  createdAt: string
  quoteStatus: string | null
  quotePrice: number | null
  customerName: string | null
  customerPhone: string | null
  technicianName: string | null
  paymentType: 'cash' | 'bank' | 'wallet'
  paymentMethodId: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  receiptUrl: string | null
  contactPhone?: string | null
  quoteRespondedAt: string | null
}

export type AdminOrderDetail = Order & {
  technicianId: string | null
  technicianPhone: string | null
}

export type AvailableTechnician = {
  technicianId: string
  profileId: string
  name: string
  phone: string | null
}

// ─── خريطة تحويل الصف من DB إلى AdminOrderRow ──────────────────────────────

function mapOrderRow(row: any): AdminOrderRow {
  const profile = row.profiles
  const assignment = Array.isArray(row.assignments) ? row.assignments[0] : null
  const techProfile = assignment?.technicians?.profiles ?? null

  return {
    id: row.id,
    orderNumber: row.order_number,
    orderType: row.order_type,
    status: row.status,
    totalAmount: row.total_amount ?? 0,
    address: row.address,
    preferredDate: row.preferred_date ?? null,
    preferredTimeSlot: row.preferred_time_slot ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    quoteStatus: row.quote_status ?? null,
    quotePrice: row.quote_price ?? null,
    customerName: profile?.full_name ?? null,
    customerPhone: profile?.phone ?? null,
    technicianName: techProfile?.full_name ?? null,
    paymentType: row.payment_type ?? 'cash',
    paymentMethodId: row.payment_method_id ?? null,
    city: row.city ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    receiptUrl: row.receipt_url ?? null,
    contactPhone: row.contact_phone ?? null,
    quoteRespondedAt: row.quote_responded_at ?? null,
  }
}

// ─── جلب قائمة الطلبات ──────────────────────────────────────────────────────

export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<{
  orders: AdminOrderRow[]
  totalCount: number
  totalPages: number
}> {
  const supabase = await createServerClient()
  const { status, order_type, search, page = 1, limit = 15 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select(
      `id, order_number, order_type, status, total_amount, address,
       preferred_date, preferred_time_slot, notes, created_at,
       quote_status, quote_price,
       profiles!orders_customer_id_fkey(full_name, phone),
       assignments(technicians(profiles(full_name)))`,
      { count: 'exact' }
    )

  if (status && status !== 'all') query = query.eq('status', status)
  if (order_type && order_type !== 'all') query = query.eq('order_type', order_type)
  
  if (search?.trim()) {
    const s = search.trim()
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${s}%`)
      
    const profileIds = matchedProfiles?.map(p => p.id) || []
    
    let orCondition = `order_number.ilike.%${s}%`
    if (profileIds.length > 0) {
      orCondition += `,customer_id.in.(${profileIds.join(',')})`
    }
    query = query.or(orCondition)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getAdminOrders]', error)
    return { orders: [], totalCount: 0, totalPages: 0 }
  }

  const orders = (data ?? []).map(mapOrderRow)
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  return { orders, totalCount, totalPages }
}

// ─── جلب طلب واحد كامل ──────────────────────────────────────────────────────

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_customer_id_fkey(id, full_name, phone, email, address),
      order_items(
        id, item_type, quantity, unit_price, total_price, include_installation,
        products(id, name, image_url),
        service_types(id, name)
      ),
      assignments(
        id, technician_id, technician_notes, created_at,
        technicians(profiles(id, full_name, phone))
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !data) return null

  const assignment = Array.isArray(data.assignments) ? data.assignments[0] : null
  const techProfile = assignment?.technicians?.profiles ?? null
  const customerProfile = data.profiles ?? null

  return {
    id: data.id,
    orderNumber: data.order_number,
    customerId: data.customer_id,
    orderType: data.order_type,
    status: data.status,
    totalAmount: data.total_amount ?? 0,
    address: data.address,
    preferredDate: data.preferred_date ?? null,
    preferredTimeSlot: data.preferred_time_slot ?? null,
    notes: data.notes ?? null,
    includeInstallation: data.include_installation ?? false,
    createdAt: data.created_at,
    quoteStatus: data.quote_status ?? null,
    quotePrice: data.quote_price ?? null,
    quoteDetails: data.quote_details ?? null,
    quoteDuration: data.quote_duration ?? null,
    quoteSentAt: data.quote_sent_at ?? null,
    quoteRespondedAt: data.quote_responded_at ?? null,
    rejectionReason: data.rejection_reason ?? null,
    quoteAttachmentUrl: data.quote_attachment_url ?? null,
    paymentType: data.payment_type ?? 'cash',
    paymentMethodId: data.payment_method_id ?? null,
    paymentMethodName: null,
    paymentMethodAccountNumber: null,
    city: data.city ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    scheduledPeriod: data.scheduled_period ?? null,
    scheduledHour: data.scheduled_hour ?? null,
    technicianNotes: data.technician_notes ?? null,
    technicianName: techProfile?.full_name ?? null,
    technicianId: assignment?.technician_id ?? null,
    technicianPhone: techProfile?.phone ?? null,
    customerProfile: customerProfile ? {
      id: customerProfile.id,
      email: customerProfile.email ?? '',
      fullName: customerProfile.full_name ?? '',
      phone: customerProfile.phone ?? null,
      role: 'customer',
      isComplete: true,
      avatarUrl: null,
      address: customerProfile.address ?? null,
      createdAt: data.created_at,
    } : null,
    items: (data.order_items ?? []).map((item: any) => ({
      id: item.id,
      orderId: data.id,
      itemType: item.item_type,
      productId: item.products?.id ?? null,
      serviceTypeId: item.service_types?.id ?? null,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      includeInstallation: item.include_installation ?? false,
      product: item.products ?? undefined,
      service: item.service_types ?? undefined,
    })),
    receiptUrl: data.receipt_url ?? null,
    contactPhone: data.contact_phone ?? null,
  }
}

// ─── جلب الفنيين المتاحين ───────────────────────────────────────────────────

export async function getAvailableTechnicians(): Promise<AvailableTechnician[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('technicians')
    .select('id, profile_id, profiles(full_name, phone)')
    .eq('is_active', true)
    .eq('status', 'available')

  if (error || !data) return []

  return data.map((t: any) => ({
    technicianId: t.id,
    profileId: t.profile_id,
    name: t.profiles?.full_name ?? 'فني',
    phone: t.profiles?.phone ?? null,
  }))
}

// ─── جلب عروض الأسعار ───────────────────────────────────────────────────────

export type AdminQuoteFilters = {
  quote_status?: string
  page?: number
  limit?: number
}

export async function getAdminQuotes(filters: AdminQuoteFilters = {}): Promise<{
  orders: AdminOrderRow[]
  totalCount: number
  totalPages: number
}> {
  const supabase = await createServerClient()
  const { quote_status, page = 1, limit = 15 } = filters
  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select(
      `id, order_number, order_type, status, total_amount, address,
       preferred_date, preferred_time_slot, notes, created_at,
       quote_status, quote_price, quote_responded_at,
       profiles!orders_customer_id_fkey(full_name, phone),
       assignments(technicians(profiles(full_name)))`,
      { count: 'exact' }
    )
    .eq('order_type', 'quote_request')

  if (quote_status && quote_status !== 'all') {
    query = query.eq('quote_status', quote_status)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getAdminQuotes]', error)
    return { orders: [], totalCount: 0, totalPages: 0 }
  }

  const orders = (data ?? []).map(mapOrderRow)
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  return { orders, totalCount, totalPages }
}
