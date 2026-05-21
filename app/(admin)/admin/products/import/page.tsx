import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import ExcelImporter from '@/components/admin/products/ExcelImporter'

export const metadata = { title: 'استيراد المخزون بالجملة — تمّ' }

export default async function AdminProductsImportPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    redirect('/home')
  }

  // جلب كافة المنتجات الحالية من قاعدة البيانات للمطابقة
  // نجلب فقط الحقول المطلوبة للمطابقة وتقليل حجم البيانات الممررة
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, supplier_sku, stock_quantity, cost_price')
    .order('name', { ascending: true })

  if (error) {
    console.error('[AdminProductsImportPage] Error fetching products:', error.message)
  }

  const mappedProducts = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    supplierSku: p.supplier_sku,
    stockQuantity: p.stock_quantity,
    costPrice: p.cost_price
  }))

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.5rem 0' }}>
      
      {/* العودة للمنتجات */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link href="/admin/products" style={{ 
          color: 'var(--text-second)', 
          textDecoration: 'none', 
          fontSize: '0.85rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.375rem',
          fontWeight: 600
        }}>
          ← العودة لإدارة المنتجات
        </Link>
      </div>

      {/* عنوان الصفحة */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.625rem', 
          fontWeight: 800, 
          color: 'var(--text-primary)', 
          margin: '0 0 0.375rem' 
        }}>
          📥 استيراد وتحديث المخزون بالجملة
        </h1>
        <p style={{ color: 'var(--text-second)', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
          ارفع ملف Excel أو CSV يحتوي على كود المورد (SKU) أو اسم المنتج، الكمية الجديدة، وسعر التكلفة (اختياري) لمطابقتها وتحديثها فوراً.
        </p>
      </div>

      {/* مكون استيراد ملف Excel */}
      <ExcelImporter products={mappedProducts} />
      
    </div>
  )
}
