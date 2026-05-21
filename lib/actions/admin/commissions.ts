'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { TaskType, CommissionType } from '@/lib/types/commission'

// ─── حساب العمولة تلقائياً عند إتمام طلب ──────────────────────────────────────

export async function calculateCommissionForOrder(orderId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerClient()

    // جلب بيانات الطلب والتعيين
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id, order_type, total_amount, include_installation,
        order_items(item_type, unit_price, total_price, quantity, include_installation),
        assignments(technician_id)
      `)
      .eq('id', orderId)
      .single()

    if (!order) return { error: 'الطلب غير موجود' }

    const assignments = order.assignments as Array<{ technician_id: string }> | null
    const technicianId = assignments?.[0]?.technician_id
    if (!technicianId) return { error: 'لا يوجد فني معين لهذا الطلب' }

    // التحقق من عدم وجود عمولة مسجلة مسبقاً
    const { data: existing } = await supabase
      .from('technician_earnings')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existing) return {} // العمولة مسجلة مسبقاً — لا حاجة لإعادة الحساب

    // تحديد نوع المهمة بناءً على نوع الطلب
    let taskType: TaskType = 'maintenance'
    const items = order.order_items as Array<{
      item_type: string
      unit_price: number
      total_price: number
      quantity: number
      include_installation: boolean
    }> | null

    if (order.order_type === 'product') {
      const hasInstallation = items?.some(i => i.include_installation) || order.include_installation
      taskType = hasInstallation ? 'installation' : 'maintenance'
    } else if (order.order_type === 'service') {
      taskType = 'maintenance'
    } else if (order.order_type === 'quote') {
      taskType = 'quote_visit'
    } else if (order.order_type === 'inspection') {
      taskType = 'inspection'
    }

    // جلب قاعدة العمولة المناسبة
    const { data: rule } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('task_type', taskType)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!rule) return { error: 'لا توجد قاعدة عمولة مفعّلة لهذا النوع من المهام' }

    // حساب مبلغ العمولة
    let commissionAmount = 0
    const orderAmount = Number(order.total_amount)

    if (rule.commission_type === 'fixed_amount') {
      commissionAmount = Number(rule.value)
    } else {
      // نسبة مئوية
      if (taskType === 'installation') {
        // العمولة على رسوم التركيب فقط
        let installationFee = 0
        if (items) {
          for (const item of items) {
            const baseTotal = item.unit_price * item.quantity
            const installPart = Math.max(0, item.total_price - baseTotal)
            installationFee += installPart
          }
        }
        commissionAmount = (installationFee * Number(rule.value)) / 100
      } else {
        // العمولة على المبلغ الكلي
        commissionAmount = (orderAmount * Number(rule.value)) / 100
      }
    }

    // تسجيل العمولة
    const { error: insertError } = await supabase
      .from('technician_earnings')
      .insert({
        technician_id: technicianId,
        order_id: orderId,
        task_type: taskType,
        order_amount: orderAmount,
        commission_amount: commissionAmount,
      })

    if (insertError) {
      console.error('[calculateCommission insert error]', insertError)
      return { error: 'فشل تسجيل العمولة' }
    }

    revalidatePath('/admin/technicians')
    return {}
  } catch (err) {
    console.error('[calculateCommissionForOrder]', err)
    return { error: 'حدث خطأ أثناء حساب العمولة' }
  }
}

// ─── تسجيل صرف العمولة ────────────────────────────────────────────────────────

export async function markEarningAsPaid(earningId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('technician_earnings')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
    })
    .eq('id', earningId)

  if (error) {
    console.error('[markEarningAsPaid]', error)
    return { error: 'فشل تحديث حالة الصرف' }
  }

  revalidatePath('/admin/technicians')
  return {}
}

// ─── صرف جميع المستحقات المعلقة لفني ──────────────────────────────────────────

export async function markAllEarningsAsPaid(technicianId: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('technician_earnings')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
    })
    .eq('technician_id', technicianId)
    .eq('is_paid', false)

  if (error) {
    console.error('[markAllEarningsAsPaid]', error)
    return { error: 'فشل صرف المستحقات' }
  }

  revalidatePath('/admin/technicians')
  return {}
}

// ─── إضافة / تعديل قاعدة عمولة ───────────────────────────────────────────────

export async function upsertCommissionRule(data: {
  id?: string
  taskType: TaskType
  commissionType: CommissionType
  value: number
  description?: string
  isActive?: boolean
}): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const row = {
    task_type: data.taskType,
    commission_type: data.commissionType,
    value: data.value,
    description: data.description ?? null,
    is_active: data.isActive ?? true,
  }

  if (data.id) {
    const { error } = await supabase
      .from('commission_rules')
      .update(row)
      .eq('id', data.id)
    if (error) return { error: 'فشل تحديث القاعدة' }
  } else {
    const { error } = await supabase
      .from('commission_rules')
      .insert(row)
    if (error) return { error: 'فشل إضافة القاعدة' }
  }

  revalidatePath('/admin/settings/commissions')
  return {}
}

// ─── تبديل تفعيل/تعطيل قاعدة ─────────────────────────────────────────────────

export async function toggleCommissionRule(ruleId: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('commission_rules')
    .update({ is_active: isActive })
    .eq('id', ruleId)

  if (error) return { error: 'فشل تحديث حالة القاعدة' }

  revalidatePath('/admin/settings/commissions')
  return {}
}
