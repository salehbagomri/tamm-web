// شعار منصة تمّ — مكوّن SVG قابل لإعادة الاستخدام مع تحكم كامل بالألوان والحجم
// الاستخدام:
//   <TammLogo size={48} />                              — افتراضي (أخضر/كحلي)
//   <TammLogo size={64} primary="#fff" secondary="#fff" /> — أبيض كامل
//   <TammLogo size={32} primary="var(--blue-light)" />    — لون مخصص من المتغيرات

import type { CSSProperties } from 'react'

interface TammLogoProps {
  /** حجم الشعار بالبكسل (عرض = ارتفاع) */
  size?: number
  /** اللون الأساسي للمربعين الدائريين والشريط العلوي (الأخضر الافتراضي) */
  primary?: string
  /** اللون الثانوي للإطار السفلي والجانبي (الكحلي الافتراضي) */
  secondary?: string
  /** فئة CSS اختيارية */
  className?: string
  /** style إضافي */
  style?: CSSProperties
  /** وصف للقارئ الصوتي */
  title?: string
}

export default function TammLogo({
  size = 40,
  primary = '#22c98a',
  secondary = '#082645',
  className,
  style,
  title = 'شعار منصة تمّ',
}: TammLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="208.97" y="134.57" width="93.07" height="93.07" transform="translate(202.89 -127.62) rotate(45)" fill={primary} />
      <rect x="208.97" y="266.05" width="93.07" height="93.07" transform="translate(295.87 -89.11) rotate(45)" fill={primary} />
      <path d="M55,22.26h402c30.36,0,55,24.64,55,55v37.92H0v-37.92C0,46.91,24.64,22.26,55,22.26Z" fill={primary} />
      <path d="M0,396.79h512v37.92c0,30.36-24.64,55-55,55H55c-30.36,0-55-24.64-55-55v-37.92h0Z" fill={secondary} />
      <path d="M326.05,303.32h228.97c27.6,0,50,22.4,50,50v42.92h-278.97v-92.92h0Z" transform="translate(815.32 -115.76) rotate(90)" fill={secondary} />
      <path d="M-93.03,303.32H185.95v37.92c0,30.36-24.64,55-55,55H-93.03v-92.92h0Z" transform="translate(396.24 303.32) rotate(90)" fill={secondary} />
    </svg>
  )
}
