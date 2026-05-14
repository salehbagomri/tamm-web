import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/utils/auth'
import { getPaymentMethods } from '@/lib/data/payment'
import CheckoutForm from '@/components/customer/checkout/CheckoutForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'إتمام الطلب | تمّ' }

export default async function CheckoutPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, paymentMethods] = await Promise.all([
    getUserProfile(supabase, user.id),
    getPaymentMethods(),
  ])

  return <CheckoutForm
    initialAddress={profile?.address ?? null}
    initialPhone={profile?.phone ?? null}
    paymentMethods={paymentMethods}
  />
}
