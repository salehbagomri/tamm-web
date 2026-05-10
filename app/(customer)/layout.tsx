import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/auth'
import CustomerNavbar from '@/components/customer/CustomerNavbar'
import { CartProvider } from '@/lib/store/cart-context'
import type { UserProfile } from '@/lib/types/user'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  // جلب الجلسة والبروفايل من الخادم
  let profile: UserProfile | null = null

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      profile = await getUserProfile(supabase, user.id)

      // fallback إذا لم يُنشأ البروفايل بعد
      if (!profile) {
        profile = {
          id: user.id,
          email: user.email ?? '',
          fullName: user.user_metadata?.full_name ?? 'مستخدم',
          phone: null,
          role: 'customer',
          isComplete: false,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          address: null,
          createdAt: user.created_at,
        }
      }
    }
  } catch {
    // فشل جلب الجلسة — يعمل كـ Guest
  }

  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <CustomerNavbar user={profile} />
        <main>{children}</main>
      </div>
    </CartProvider>
  )
}
