// أنواع نظام العمولة

export type TaskType = 'installation' | 'maintenance' | 'inspection' | 'quote_visit'

export type CommissionType = 'percentage' | 'fixed_amount'

export interface CommissionRule {
  id: string
  taskType: TaskType
  commissionType: CommissionType
  value: number
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface TechnicianEarning {
  id: string
  technicianId: string
  orderId: string
  taskType: TaskType
  orderAmount: number
  commissionAmount: number
  isPaid: boolean
  paidAt: string | null
  notes: string | null
  createdAt: string
  // بيانات مرتبطة (اختيارية)
  orderNumber?: string
  technicianName?: string
}

// ملصقات عربية لأنواع المهام
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  installation: 'تركيب',
  maintenance: 'صيانة',
  inspection: 'معاينة / كشف',
  quote_visit: 'زيارة عرض سعر',
}

// ملصقات عربية لأنواع العمولة
export const COMMISSION_TYPE_LABELS: Record<CommissionType, string> = {
  percentage: 'نسبة مئوية (%)',
  fixed_amount: 'مبلغ ثابت (ر.س)',
}
