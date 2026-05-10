import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/utils/auth'

// صفحة الجذر — تُوجّه حسب الجلسة والدور
export default async function RootPage() {
  // تجاوز إذا لم تُضَف مفاتيح Supabase بعد
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    redirect('/login')
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // لا جلسة → تسجيل الدخول
  if (!user) {
    redirect('/login')
  }

  // جلسة موجودة → توجيه حسب الدور
  const role = await getUserRole(supabase, user.id)

  if (role === 'manager') {
    redirect('/admin/dashboard')
  }

  // عميل أو دور غير معروف → الصفحة الرئيسية
  redirect('/home')
}
