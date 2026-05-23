import { redirect } from 'next/navigation'

// /profile كان النقطة المركزية لقسم الحساب — تم نقله إلى /account كـ Hub.
// نحتفظ بهذا الـ redirect حفاظاً على أي روابط خارجية أو bookmarks قديمة.
export default function ProfileRedirectPage() {
  redirect('/account')
}
