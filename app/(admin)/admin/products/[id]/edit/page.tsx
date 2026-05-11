import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getAdminProductById } from '@/lib/data/admin/products'
import AdminProductForm from '@/components/admin/products/AdminProductForm'

interface PageProps { params: Promise<{ id: string }> }

export const metadata = { title: 'تعديل المنتج — تمّ' }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/home')

  const product = await getAdminProductById(id)
  if (!product) notFound()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.75rem' }}>
        تعديل: {product.name}
      </h1>
      <AdminProductForm product={product} />
    </div>
  )
}
