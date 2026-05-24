'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import type { TaskType, CommissionType } from '@/lib/types/commission'

// ─── حساب العمولة تلقائياً عند إتمام طلب ──────────────────────────────────────

export async function calculateCommissionForOrder(orderId: string): Promise<{ error?: string }> {
  try {
    // نستخدم Admin Client لتجاوز قيود RLS
    const supabase = createAdminClient()

    console.log('[Commission] بدء حساب العمولة للطلب:', orderId)

    // جلب بيانات الطلب
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select(`
        id, order_type, total_amount, include_installation,
        order_items(item_type, unit_price, total_price, quantity, include_installation, product_id, products(installation_price))
      `)
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      console.error('[Commission] فشل جلب الطلب:', orderErr)
      return { error: 'الطلب غير موجود' }
    }

    console.log('[Commission] نوع الطلب:', order.order_type, '| المبلغ:', order.total_amount)

    // جلب الفني من جدول التعيينات
    const { data: assignment } = await supabase
      .from('assignments')
      .select('technician_id')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // fallback: إذا لم يوجد في assignments، نبحث في technician_id بالطلب مباشرة
    let technicianId = assignment?.technician_id ?? null

    if (!technicianId) {
      const { data: orderDirect } = await supabase
        .from('orders')
        .select('technician_id')
        .eq('id', orderId)
        .single()
      technicianId = orderDirect?.technician_id ?? null
    }

    if (!technicianId) {
      console.error('[Commission] لا يوجد فني معين للطلب:', orderId)
      return { error: 'لا يوجد فني معين لهذا الطلب' }
    }

    console.log('[Commission] الفني المعين:', technicianId)

    // التحقق من عدم وجود عمولة مسجلة مسبقاً
    const { data: existing } = await supabase
      .from('technician_earnings')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle()

    if (existing) {
      console.log('[Commission] العمولة مسجلة مسبقاً — تم التخطي')
      return {}
    }

    // تحديد نوع المهمة بناءً على نوع الطلب
    let taskType: TaskType = 'maintenance'
    const items = order.order_items as unknown as Array<{
      item_type: string
      unit_price: number
      total_price: number
      quantity: number
      include_installation: boolean
      product_id: string | null
      products: {
        installation_price: number
      } | Array<{
        installation_price: number
      }> | null
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

    console.log('[Commission] نوع المهمة:', taskType)

    // جلب قاعدة العمولة المناسبة
    const { data: rule, error: ruleErr } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('task_type', taskType)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (ruleErr || !rule) {
      console.error('[Commission] لم يتم العثور على قاعدة عمولة للنوع:', taskType, ruleErr)
      return { error: 'لا توجد قاعدة عمولة مفعّلة لهذا النوع من المهام' }
    }

    console.log('[Commission] القاعدة:', rule.commission_type, '=', rule.value)

    // حساب مبلغ العمولة
    let commissionAmount = 0
    const orderAmount = Number(order.total_amount)

    if (rule.commission_type === 'fixed_amount') {
      commissionAmount = Number(rule.value)
    } else {
      // نسبة مئوية
      if (taskType === 'installation') {
        let installationFee = 0
        if (items) {
          for (const item of items) {
            if (item.include_installation) {
              // التعامل بمرونة مع كون الحقل كائن منفرد أو مصفوفة منضمة
              let installPrice = 0
              if (item.products) {
                if (Array.isArray(item.products)) {
                  installPrice = item.products[0]?.installation_price ?? 0
                } else {
                  installPrice = item.products.installation_price ?? 0
                }
              }
              installationFee += Number(installPrice) * item.quantity
            }
          }
        }
        commissionAmount = (installationFee * Number(rule.value)) / 100
      } else {
        commissionAmount = (orderAmount * Number(rule.value)) / 100
      }
    }

    console.log('[Commission] مبلغ العمولة المحسوب:', commissionAmount)

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
      console.error('[Commission] فشل الإدراج:', insertError)
      return { error: `فشل تسجيل العمولة: ${insertError.message}` }
    }

    console.log('[Commission] ✅ تم تسجيل العمولة بنجاح!')
    revalidatePath('/admin/technicians')
    revalidatePath('/admin/technicians/earnings')
    return {}
  } catch (err) {
    console.error('[Commission] خطأ غير متوقع:', err)
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
