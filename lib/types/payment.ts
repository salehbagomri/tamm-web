export type PaymentMethodType = 'bank' | 'wallet'

export type PaymentMethod = {
  id: string
  type: PaymentMethodType
  name: string
  accountNumber: string | null
  logoUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}
