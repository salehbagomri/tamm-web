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
    image_url: data.imageUrl ?? null,
    specs: data.specs ?? {},
    cost_price: data.costPrice ?? null,
    stock_quantity: data.stockQuantity ?? 0,
    low_stock_threshold: data.lowStockThreshold ?? 3,
    supplier_name: data.supplierName?.trim() || null,
    supplier_sku: data.supplierSku?.trim() || null,
    auto_hide_when_out: data.autoHideWhenOut ?? true,
  }).select('id').single()

  if (error) { console.error('[createProduct]', error); return { error: 'فشل إنشاء المنتج' } }
  revalidateProducts()
  return { id: row.id }
}

export async function updateProduct(id: string, data: ProductFormData): Promise<{ error?: string }> {
  const supabase = await createServerClient()

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
    image_url: data.imageUrl ?? null,
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

  if (upErr) { console.error('[uploadProductImage]', upErr); return { error: 'فشل رفع الصورة' } }

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
