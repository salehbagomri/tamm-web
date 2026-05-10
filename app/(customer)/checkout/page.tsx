import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/utils/auth'
import CheckoutForm from '@/components/customer/checkout/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'إتمام الطلب | تمّ' }

export default async function CheckoutPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(supabase, user.id)

  return <CheckoutForm
    initialAddress={profile?.address ?? null}
    initialPhone={profile?.phone ?? null}
  />
}
