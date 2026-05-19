import { createServerClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/lib/types/product'
import type { ServiceType, ServiceCategory } from '@/lib/types/service'
import type { Order, OrderStatus, OrderType, QuoteStatus } from '@/lib/types/order'

// ── تعريف الأنواع الخام من Supabase (snake_case) ──

type RawProduct = {
  id: string; name: string; description: string | null
  category: string; price: number | null; is_price_on_request: boolean
  image_url: string | null; brand: string | null; specs: Record<string, unknown>
  is_available: boolean; is_featured: boolean; requires_installation: boolean
  installation_price: number; old_price: number | null
}

type RawService = {
  id: string; name: string; description: string | null
  category: string; base_price: number; icon_name: string | null
  is_active: boolean; is_quote_based: boolean
  includes: string[]; estimated_duration: string | null
}

type RawOrder = {
  id: string; order_number: string; customer_id: string
  order_type: string; status: string; total_amount: number
  address: string; created_at: string; include_installation: boolean
  preferred_date: string | null; preferred_time_slot: string | null
  notes: string | null; technician_id: string | null; technician_name: string | null
  technician_notes: string | null; scheduled_period: string | null
  scheduled_hour: string | null; quote_price: number | null
  quote_details: string | null; quote_duration: string | null
  quote_status: string | null; quote_sent_at: string | null
  quote_responded_at: string | null; rejection_reason: string | null
  quote_attachment_url: string | null
  payment_type: string | null; payment_method_id: string | null
  city: string | null; latitude: number | null; longitude: number | null
  receipt_url: string | null
}

export type Promotion = {
  id: string; title: string; subtitle: string | null
  iconName: string | null; gradientStart: string | null
  gradientEnd: string | null; destination: string | null
  sortOrder: number; isActive: boolean
}

// ── دوال التحويل ──

function mapProduct(r: RawProduct): Product {
  return {
    id: r.id, name: r.name, description: r.description,
    category: r.category as ProductCategory, price: r.price,
    isPriceOnRequest: r.is_price_on_request, imageUrl: r.image_url,
    brand: r.brand, specs: r.specs, isAvailable: r.is_available,
    isFeatured: r.is_featured, requiresInstallation: r.requires_installation,
    installationPrice: r.installation_price, oldPrice: r.old_price,
  }
}

function mapService(r: RawService): ServiceType {
  return {
    id: r.id, name: r.name, description: r.description,
    category: r.category as ServiceCategory, basePrice: r.base_price,
    iconName: r.icon_name, isActive: r.is_active,
    isQuoteBased: r.is_quote_based, includes: r.includes ?? [],
    estimatedDuration: r.estimated_duration,
  }
}

function mapOrder(r: RawOrder): Order {
  return {
    id: r.id, orderNumber: r.order_number, customerId: r.customer_id,
    orderType: r.order_type as OrderType, status: r.status as OrderStatus,
    totalAmount: r.total_amount, address: r.address, createdAt: r.created_at,
    includeInstallation: r.include_installation,
    preferredDate: r.preferred_date, preferredTimeSlot: r.preferred_time_slot,
    notes: r.notes, items: [], customerProfile: null,
    technicianId: r.technician_id ?? null,
    technicianName: r.technician_name, technicianNotes: r.technician_notes,
    scheduledPeriod: r.scheduled_period, scheduledHour: r.scheduled_hour,
    quotePrice: r.quote_price, quoteDetails: r.quote_details,
    quoteDuration: r.quote_duration, quoteStatus: r.quote_status as QuoteStatus | null,
    quoteSentAt: r.quote_sent_at, quoteRespondedAt: r.quote_responded_at,
    rejectionReason: r.rejection_reason, quoteAttachmentUrl: r.quote_attachment_url,
    paymentType: (r.payment_type as 'cash' | 'bank' | 'wallet') ?? 'cash',
    paymentMethodId: r.payment_method_id ?? null,
    city: r.city ?? null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    receiptUrl: r.receipt_url ?? null,
  }
}

// ── دوال جلب البيانات ──

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as RawProduct[] ?? []).map(mapProduct)
  } catch { return [] }
}

export async function getServices(): Promise<ServiceType[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('service_types')
      .select('*')
      .eq('is_active', true)
      .limit(6)
    return (data as RawService[] ?? []).map(mapService)
  } catch { return [] }
}

export async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (!data) return []
    return data.map((p) => ({
      id: p.id, title: p.title, subtitle: p.subtitle,
      iconName: p.icon_name, gradientStart: p.gradient_start,
      gradientEnd: p.gradient_end, destination: p.destination,
      sortOrder: p.sort_order, isActive: p.is_active,
    }))
  } catch { return [] }
}

const ACTIVE_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress',
]

export async function getActiveOrder(userId: string): Promise<Order | null> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data ? mapOrder(data as RawOrder) : null
  } catch { return null }
}
