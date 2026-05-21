import { createServerClient } from '@/lib/supabase/server'
import type { CommissionRule, TechnicianEarning, TaskType } from '@/lib/types/commission'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapRule(row: Record<string, unknown>): CommissionRule {
  return {
    id: row.id as string,
    taskType: row.task_type as TaskType,
    commissionType: row.commission_type as 'percentage' | 'fixed_amount',
    value: Number(row.value),
    description: (row.description as string) ?? null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  }
}

function mapEarning(row: Record<string, unknown>): TechnicianEarning {
  const order = row.orders as Record<string, unknown> | null
  const tech = row.technicians as Record<string, unknown> | null
  const techProfiles = tech?.profiles as Record<string, unknown> | null

  return {
    id: row.id as string,
    technicianId: row.technician_id as string,
    orderId: row.order_id as string,
    taskType: row.task_type as TaskType,
    orderAmount: Number(row.order_amount),
    commissionAmount: Number(row.commission_amount),
    isPaid: row.is_paid as boolean,
    paidAt: (row.paid_at as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
    orderNumber: (order?.order_number as string) ?? undefined,
    technicianName: (techProfiles?.full_name as string) ?? undefined,
  }
}

// ─── قواعد العمولة ────────────────────────────────────────────────────────────

export async function getCommissionRules(): Promise<CommissionRule[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('commission_rules')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getCommissionRules]', error)
    return []
  }
  return (data as Record<string, unknown>[]).map(mapRule)
}

export async function getActiveRuleByTaskType(taskType: TaskType): Promise<CommissionRule | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('commission_rules')
    .select('*')
    .eq('task_type', taskType)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return mapRule(data as Record<string, unknown>)
}

// ─── مستحقات الفنيين ──────────────────────────────────────────────────────────

export async function getTechnicianEarnings(
  technicianId?: string,
  isPaid?: boolean
): Promise<TechnicianEarning[]> {
  const supabase = await createServerClient()
  let query = supabase
    .from('technician_earnings')
    .select(`
      *,
      orders(order_number),
      technicians(profiles(full_name))
    `)
    .order('created_at', { ascending: false })

  if (technicianId) query = query.eq('technician_id', technicianId)
  if (isPaid !== undefined) query = query.eq('is_paid', isPaid)

  const { data, error } = await query

  if (error) {
    console.error('[getTechnicianEarnings]', error)
    return []
  }
  return (data as Record<string, unknown>[]).map(mapEarning)
}

export async function getEarningsSummaryByTechnician(): Promise<{
  technicianId: string
  technicianName: string
  totalEarned: number
  totalPaid: number
  totalPending: number
  taskCount: number
}[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('technician_earnings')
    .select(`
      technician_id,
      commission_amount,
      is_paid,
      technicians(profiles(full_name))
    `)

  if (error || !data) return []

  const map = new Map<string, {
    technicianName: string
    totalEarned: number
    totalPaid: number
    totalPending: number
    taskCount: number
  }>()

  for (const row of data as Record<string, unknown>[]) {
    const techId = row.technician_id as string
    const amount = Number(row.commission_amount)
    const isPaid = row.is_paid as boolean
    const tech = row.technicians as Record<string, unknown> | null
    const profile = tech?.profiles as Record<string, unknown> | null
    const name = (profile?.full_name as string) ?? 'فني'

    if (!map.has(techId)) {
      map.set(techId, { technicianName: name, totalEarned: 0, totalPaid: 0, totalPending: 0, taskCount: 0 })
    }
    const entry = map.get(techId)!
    entry.totalEarned += amount
    entry.taskCount += 1
    if (isPaid) entry.totalPaid += amount
    else entry.totalPending += amount
  }

  return Array.from(map.entries()).map(([technicianId, data]) => ({
    technicianId,
    ...data,
  }))
}

// ─── مستحقات فني محدد (ملخص شهري) ────────────────────────────────────────────

export async function getTechnicianEarningsSummary(technicianId: string): Promise<{
  thisMonth: number
  paid: number
  pending: number
  recentEarnings: TechnicianEarning[]
}> {
  const supabase = await createServerClient()
  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`

  // مستحقات هذا الشهر
  const { data: monthData } = await supabase
    .from('technician_earnings')
    .select('commission_amount')
    .eq('technician_id', technicianId)
    .gte('created_at', firstOfMonth)

  const thisMonth = (monthData ?? []).reduce((s, r) => s + Number(r.commission_amount), 0)

  // إجمالي المدفوع والمعلق
  const { data: allData } = await supabase
    .from('technician_earnings')
    .select('commission_amount, is_paid')
    .eq('technician_id', technicianId)

  let paid = 0, pending = 0
  for (const row of allData ?? []) {
    if (row.is_paid) paid += Number(row.commission_amount)
    else pending += Number(row.commission_amount)
  }

  // آخر 10 مهام
  const { data: recent } = await supabase
    .from('technician_earnings')
    .select(`*, orders(order_number), technicians(profiles(full_name))`)
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentEarnings = (recent as Record<string, unknown>[] ?? []).map(mapEarning)

  return { thisMonth, paid, pending, recentEarnings }
}
