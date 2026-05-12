import type { Metadata } from 'next'
import { Alexandria } from 'next/font/google'
import './globals.css'

// خط Alexandria من Google Fonts
const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-alexandria',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'تمّ | خدمات التكييف والطاقة الشمسية',
  description: 'منصة تمّ لإدارة خدمات التكييف والطاقة الشمسية — احجز خدمتك بكل سهولة',
  keywords: ['تكييف', 'طاقة شمسية', 'صيانة', 'تركيب', 'تمّ'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={alexandria.variable}>
      <body className={alexandria.className}>
        {children}
      </body>
    </html>
  )
}
