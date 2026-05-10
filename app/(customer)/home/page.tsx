import { createServerClient } from '@/lib/supabase/server'
import { getFeaturedProducts, getServices, getActivePromotions, getActiveOrder } from '@/lib/data/home'
import HeroSection from '@/components/customer/home/HeroSection'
import CategorySection from '@/components/customer/home/CategorySection'
import PromoSection from '@/components/customer/home/PromoSection'
import FeaturedProductsSection from '@/components/customer/home/FeaturedProductsSection'
import ServicesSection from '@/components/customer/home/ServicesSection'
import WhyUsSection from '@/components/customer/home/WhyUsSection'
import CTASection from '@/components/customer/home/CTASection'
import ActiveOrderBanner from '@/components/customer/home/ActiveOrderBanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'تمّ | الرئيسية',
  description: 'منصة تمّ لخدمات التكييف والطاقة الشمسية — تصفح المنتجات واحجز خدمتك بكل سهولة',
}

export default async function HomePage() {
  // جلب البيانات بالتوازي
  const [products, services, promotions] = await Promise.all([
    getFeaturedProducts(),
    getServices(),
    getActivePromotions(),
  ])

  // الطلب النشط — للمستخدمين المسجلين فقط
  let activeOrder = null
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      activeOrder = await getActiveOrder(user.id)
    }
  } catch { /* زائر */ }

  return (
    <>
      {/* بانر الطلب النشط */}
      {activeOrder && <ActiveOrderBanner order={activeOrder} />}

      <HeroSection />
      <CategorySection />

      {/* العروض — تظهر فقط عند وجود بيانات */}
      {promotions.length > 0 && <PromoSection promotions={promotions} />}

      <FeaturedProductsSection products={products} />
      <ServicesSection services={services} />
      <WhyUsSection />
      <CTASection />
    </>
  )
}
