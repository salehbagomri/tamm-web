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
      id, profile_id, is_available,
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
      isAvailable: t.is_available ?? true,
      assignedOrdersCount: count ?? 0,
    })
  }
  return results
}

export async function getAdminTechnicianById(id: string): Promise<AdminTechnician | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('technicians')
    .select('id, profile_id, is_available, profiles!technicians_profile_id_fkey(full_name, phone, email)')
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
    isAvailable: data.is_available ?? true,
    assignedOrdersCount: count ?? 0,
  }
}
