import { redirect } from 'next/navigation'

// الجذر يُوجَّه دائماً للـ home — الـ proxy يتولى التوجيه الدقيق حسب الدور
export default function RootPage() {
  redirect('/home')
}
