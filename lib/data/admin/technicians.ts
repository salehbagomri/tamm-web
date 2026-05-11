import { createServerClient } from '@/lib/supabase/server'

export type AdminTechnician = {
  technicianId: string
  profileId: string
  name: string
  phone: string | null
  email: string | null
  isAvailable: boolean
  assignedOrdersCount: number
}

export async function getAdminTechnicians(): Promise<AdminTechnician[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('technicians')
    .select(`
      id, profile_id, is_active, status,
      profiles!technicians_profile_id_fkey(full_name, phone, email)
    `)
    .order('created_at', { ascending: false })

  if (error) { console.error('[getAdminTechnicians]', error); return [] }

  const results: AdminTechnician[] = []
  for (const t of data ?? []) {
    const { count } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', t.id)

    results.push({
      technicianId: t.id,
      profileId: t.profile_id,
      name: (t.profiles as any)?.full_name ?? 'فني',
      phone: (t.profiles as any)?.phone ?? null,
      email: (t.profiles as any)?.email ?? null,
      isAvailable: t.status === 'available',
      assignedOrdersCount: count ?? 0,
    })
  }
  return results
}

export async function getAdminTechnicianById(id: string): Promise<AdminTechnician | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('technicians')
    .select('id, profile_id, is_active, status, profiles!technicians_profile_id_fkey(full_name, phone, email)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  const { count } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('technician_id', data.id)

  return {
    technicianId: data.id,
    profileId: data.profile_id,
    name: (data.profiles as any)?.full_name ?? 'فني',
    phone: (data.profiles as any)?.phone ?? null,
    email: (data.profiles as any)?.email ?? null,
    isAvailable: data.status === 'available',
    assignedOrdersCount: count ?? 0,
  }
}

export type TechnicianOrderRow = {
  id: string
  orderId: string
  orderNumber: string
  status: string
  address: string
  totalAmount: number
  customerName: string | null
  createdAt: string
  technicianNotes: string | null
}

export async function getAdminTechnicianOrders(technicianId: string): Promise<TechnicianOrderRow[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id, technician_notes,
      orders (
        id, order_number, status, address, total_amount, created_at,
        profiles!orders_customer_id_fkey(full_name)
      )
    `)
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((a: any) => ({
    id: a.id,
    orderId: a.orders?.id,
    orderNumber: a.orders?.order_number,
    status: a.orders?.status,
    address: a.orders?.address,
    totalAmount: a.orders?.total_amount ?? 0,
    customerName: a.orders?.profiles?.full_name ?? null,
    createdAt: a.orders?.created_at,
    technicianNotes: a.technician_notes ?? null,
  }))
}
