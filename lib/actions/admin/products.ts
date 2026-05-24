'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/lib/types/product'

function revalidateProducts(id?: string) {
  revalidatePath('/admin/products')
  revalidatePath('/store')
  revalidatePath('/home')
  if (id) revalidatePath(`/admin/products/${id}/edit`)
}

export type ProductFormData = {
  name: string
  category: ProductCategory
  brand?: string | null
  description?: string | null
  price?: number | null
  oldPrice?: number | null
  isPriceOnRequest: boolean
  requiresInstallation: boolean
  installationPrice?: number
  isAvailable: boolean
  isFeatured: boolean
  imageUrl?: string | null
  images?: Array<{ id?: string; imageUrl: string; sortOrder: number }>
  specs?: Record<string, string>
  // حقول المخزون والتكلفة
  costPrice?: number | null
  stockQuantity?: number
  lowStockThreshold?: number
  supplierName?: string | null
  supplierSku?: string | null
  autoHideWhenOut?: boolean
}

export async function createProduct(data: ProductFormData): Promise<{ id?: string; error?: string }> {
  const supabase = await createServerClient()

  // تحديد الصورة الافتراضية للتوافقية
  let primaryUrl = data.imageUrl ?? null
  if (data.images && data.images.length > 0) {
    const sorted = [...data.images].sort((a, b) => a.sortOrder - b.sortOrder)
    primaryUrl = sorted[0].imageUrl
  }

  const { data: row, error } = await supabase.from('products').insert({
    name: data.name.trim(),
    category: data.category,
    brand: data.brand?.trim() || null,
    description: data.description?.trim() || null,
    price: data.isPriceOnRequest ? null : (data.price ?? null),
    old_price: data.oldPrice ?? null,
    is_price_on_request: data.isPriceOnRequest,
    requires_installation: data.requiresInstallation,
    installation_price: data.requiresInstallation ? (data.installationPrice ?? 0) : 0,
    is_available: data.isAvailable,
    is_featured: data.isFeatured,
    image_url: primaryUrl,
    specs: data.specs ?? {},
    cost_price: data.costPrice ?? null,
    stock_quantity: data.stockQuantity ?? 0,
    low_stock_threshold: data.lowStockThreshold ?? 3,
    supplier_name: data.supplierName?.trim() || null,
    supplier_sku: data.supplierSku?.trim() || null,
    auto_hide_when_out: data.autoHideWhenOut ?? true,
  }).select('id').single()

  if (error) { console.error('[createProduct]', error); return { error: 'فشل إنشاء المنتج' } }

  // تزامن الصور المتعددة مع جدول الصور الفرعي
  if (data.images && data.images.length > 0) {
    const rowsToInsert = data.images.map((img) => ({
      product_id: row.id,
      image_url: img.imageUrl,
      sort_order: img.sortOrder,
      alt_text: data.name.trim(),
    }))
    await supabase.from('product_images').insert(rowsToInsert)
  } else if (data.imageUrl) {
    // Fallback للصورة المفردة
    await supabase.from('product_images').insert({
      product_id: row.id,
      image_url: data.imageUrl,
      sort_order: 0,
      alt_text: data.name.trim(),
    })
  }

  revalidateProducts()
  return { id: row.id }
}

export async function updateProduct(id: string, data: ProductFormData): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  // تحديد الصورة الافتراضية للتوافقية
  let primaryUrl = data.imageUrl ?? null
  if (data.images && data.images.length > 0) {
    const sorted = [...data.images].sort((a, b) => a.sortOrder - b.sortOrder)
    primaryUrl = sorted[0].imageUrl
  }

  const { error } = await supabase.from('products').update({
    name: data.name.trim(),
    category: data.category,
    brand: data.brand?.trim() || null,
    description: data.description?.trim() || null,
    price: data.isPriceOnRequest ? null : (data.price ?? null),
    old_price: data.oldPrice ?? null,
    is_price_on_request: data.isPriceOnRequest,
    requires_installation: data.requiresInstallation,
    installation_price: data.requiresInstallation ? (data.installationPrice ?? 0) : 0,
    is_available: data.isAvailable,
    is_featured: data.isFeatured,
    image_url: primaryUrl,
    specs: data.specs ?? {},
    cost_price: data.costPrice ?? null,
    stock_quantity: data.stockQuantity ?? 0,
    low_stock_threshold: data.lowStockThreshold ?? 3,
    supplier_name: data.supplierName?.trim() || null,
    supplier_sku: data.supplierSku?.trim() || null,
    auto_hide_when_out: data.autoHideWhenOut ?? true,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) { console.error('[updateProduct]', error); return { error: 'فشل تحديث المنتج' } }

  // تزامن الصور المتعددة مع جدول الصور الفرعي
  if (data.images) {
    // 1. حذف جميع الصور القديمة للمنتج
    await supabase.from('product_images').delete().eq('product_id', id)

    // 2. إدراج الصور الجديدة إن وجدت
    if (data.images.length > 0) {
      const rowsToInsert = data.images.map((img) => ({
        product_id: id,
        image_url: img.imageUrl,
        sort_order: img.sortOrder,
        alt_text: data.name.trim(),
      }))
      await supabase.from('product_images').insert(rowsToInsert)
    }
  } else if (data.imageUrl) {
    // Fallback للصورة المفردة القديمة
    const { data: existingImg } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', id)
      .eq('sort_order', 0)
      .maybeSingle()

    if (existingImg) {
      await supabase
        .from('product_images')
        .update({ image_url: data.imageUrl, alt_text: data.name.trim() })
        .eq('id', existingImg.id)
    } else {
      await supabase
        .from('product_images')
        .insert({
          product_id: id,
          image_url: data.imageUrl,
          sort_order: 0,
          alt_text: data.name.trim(),
        })
    }
  } else {
    // حذف الصورة المفردة
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)
      .eq('sort_order', 0)
  }

  revalidateProducts(id)
  return {}
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  // تحقق من ارتباط المنتج بطلبات
  const { count } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  if ((count ?? 0) > 0) return { error: 'لا يمكن حذف المنتج لأنه مرتبط بطلبات موجودة' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) { console.error('[deleteProduct]', error); return { error: 'فشل حذف المنتج' } }

  revalidateProducts()
  return {}
}

export async function uploadProductImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient()
  const file = formData.get('file') as File | null
  if (!file) return { error: 'لم يتم اختيار صورة' }
  if (file.size > 5 * 1024 * 1024) return { error: 'حجم الصورة يجب أن يكون أقل من 5 ميجا' }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowed.includes(file.type)) return { error: 'يجب أن تكون الصورة JPG أو PNG أو WebP' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `product-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (upErr) {
    console.error('[uploadProductImage]', upErr)
    return { error: `فشل رفع الصورة: ${upErr.message}` }
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(filename)
  return { url: data.publicUrl }
}

export async function toggleProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<{ error?: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('products')
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: 'فشل تحديث حالة التوفر' }
  revalidateProducts()
  return {}
}
