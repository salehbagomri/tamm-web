'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export type StockImportItem = {
  productId: string
  newQuantity: number
  newCostPrice?: number | null
  notes?: string
}

function revalidateProducts() {
  revalidatePath('/admin/products')
  revalidatePath('/store')
  revalidatePath('/home')
}

/**
 * تحديث المخزون وسعر التكلفة بالجملة وتسجيل الحركات
 */
export async function bulkUpdateStock(items: StockImportItem[]): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'غير مصرح للوصول' }

    // التحقق من صلاحيات المدير
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'manager') {
      return { error: 'عذراً، هذه العملية متاحة للمدير فقط' }
    }

    const adminClient = createAdminClient()

    for (const item of items) {
      // 1. جلب المخزون الحالي للمنتج
      const { data: product, error: fetchError } = await adminClient
        .from('products')
        .select('name, stock_quantity, cost_price, auto_hide_when_out, is_available')
        .eq('id', item.productId)
        .single()

      if (fetchError || !product) {
        console.error(`[bulkUpdateStock] Product not found: ${item.productId}`);
        continue;
      }

      const qtyBefore = product.stock_quantity ?? 0
      const qtyAfter = item.newQuantity
      const qtyChange = qtyAfter - qtyBefore

      // إذا لم يحدث تغيير في الكمية ولا في سعر التكلفة، نتجاوز
      const isCostPriceUnchanged = item.newCostPrice === undefined || item.newCostPrice === product.cost_price

      if (qtyChange === 0 && isCostPriceUnchanged) {
        continue;
      }

      // تحديث المنتج
      const updateData: Record<string, any> = {
        stock_quantity: qtyAfter,
        updated_at: new Date().toISOString()
      }

      if (item.newCostPrice !== undefined) {
        updateData.cost_price = item.newCostPrice
      }

      // إذا زاد المخزون عن صفر وكان المنتج غير متوفر وتفعيل الإخفاء التلقائي نشط، نعيد تفعيل توفر المنتج
      // ملاحظة: DB trigger يُدير is_available تلقائياً عند الخصم/الإرجاع عبر order_items، لكن لا يفحص
      // UPDATE المباشر على products، فنضبطها يدوياً هنا.
      if (qtyAfter > 0 && !product.is_available && product.auto_hide_when_out) {
        updateData.is_available = true
      }
      if (qtyAfter <= 0 && product.is_available && product.auto_hide_when_out) {
        updateData.is_available = false
      }

      const { error: updateError } = await adminClient
        .from('products')
        .update(updateData)
        .eq('id', item.productId)

      if (updateError) {
        console.error(`[bulkUpdateStock] Update failed for ${item.productId}:`, updateError.message)
        continue
      }

      // 2. تسجيل حركة المخزون
      const { error: moveError } = await adminClient
        .from('stock_movements')
        .insert({
          product_id: item.productId,
          movement_type: 'manual_adjustment',
          quantity_before: qtyBefore,
          quantity_after: qtyAfter,
          quantity_change: qtyChange,
          notes: item.notes || 'تحديث المخزون عبر استيراد إكسل بالجملة',
          performed_by: user.id
        })

      if (moveError) {
        console.error(`[bulkUpdateStock] Log movement failed for ${item.productId}:`, moveError.message)
      }
    }

    revalidateProducts()
    return { success: true }
  } catch (err: any) {
    console.error('[bulkUpdateStock] Server error:', err)
    return { error: 'حدث خطأ غير متوقع أثناء تحديث المخزون' }
  }
}
