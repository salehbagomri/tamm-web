import type { Metadata } from 'next'
import { Harmattan } from 'next/font/google'
import './globals.css'

// خط Harmattan من Google Fonts
const harmattan = Harmattan({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-harmattan',
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
    <html lang="ar" dir="rtl" className={harmattan.variable}>
      <body className={harmattan.className}>
        {children}
      </body>
    </html>
  )
}
