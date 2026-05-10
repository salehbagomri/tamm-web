// أنواع المستخدمين — منقولة من Flutter بدقة

export type UserRole = 'customer' | 'manager' | 'technician'

export type UserProfile = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  isComplete: boolean
  avatarUrl: string | null
  address: string | null
  createdAt: string
}
