import { notFound, redirect } from 'next/navigation'
import { getServiceById } from '@/lib/data/services'
import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/auth'
import ServiceBookingForm from '@/components/customer/services/ServiceBookingForm'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const s = await getServiceById(id)
  return { title: s ? `حجز ${s.name} | تمّ` : 'حجز خدمة | تمّ' }
}

export default async function BookServicePage({ params }: Props) {
  const { id } = await params
  const [service, supabase] = await Promise.all([
    getServiceById(id),
    createServerClient(),
  ])

  if (!service) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(supabase, user.id)

  return (
    <ServiceBookingForm
      service={service}
      initialAddress={profile?.address ?? null}
      initialPhone={profile?.phone ?? null}
    />
  )
}
