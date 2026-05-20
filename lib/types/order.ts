// أنواع الطلبات — منقولة من Flutter بدقة

import type { UserProfile } from './user'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type OrderType =
  | 'product'
  | 'service'
  | 'product_and_service'
  | 'quote_request'

export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'rejected'

export type OrderItem = {
  id: string
  orderId: string
  itemType: 'product' | 'service'
  productId: string | null
  serviceTypeId: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: any
  service?: any
  includeInstallation?: boolean
}

export type Order = {
  id: string
  orderNumber: string
  customerId: string
  orderType: OrderType
  status: OrderStatus
  totalAmount: number
  address: string
  preferredDate: string | null
  preferredTimeSlot: string | null
  notes: string | null
  includeInstallation: boolean
  createdAt: string
  items: OrderItem[]
  customerProfile: UserProfile | null
  technicianId: string | null
  technicianName: string | null
  technicianNotes: string | null
  scheduledPeriod: string | null
  scheduledHour: string | null
  quotePrice: number | null
  quoteDetails: string | null
  quoteDuration: string | null
  quoteStatus: QuoteStatus | null
  quoteSentAt: string | null
  quoteRespondedAt: string | null
  rejectionReason: string | null
  quoteAttachmentUrl: string | null
  paymentType: 'cash' | 'bank' | 'wallet'
  paymentMethodId: string | null
  paymentMethodName: string | null
  paymentMethodAccountNumber: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  receiptUrl: string | null
  contactPhone?: string | null
}
