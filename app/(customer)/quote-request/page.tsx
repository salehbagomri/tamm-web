import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/auth'
import QuoteRequestForm from '@/components/customer/quote/QuoteRequestForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'طلب عرض سعر | تمّ',
  description: 'احصل على عرض سعر مجاني لخدمات التكييف والطاقة الشمسية خلال 24 ساعة',
}

export default async function QuoteRequestPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getUserProfile(supabase, user.id)

  return <QuoteRequestForm initialPhone={profile?.phone ?? null} />
}
