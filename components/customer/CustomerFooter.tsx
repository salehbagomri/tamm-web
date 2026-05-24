'use client'

import Link from 'next/link'
import TammLogo from '@/components/ui/TammLogo'

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      padding: '4rem 1.5rem 2rem',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-alexandria), sans-serif',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
      }}>
        {/* العمود الأول: معلومات العلامة التجارية */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
          }}>
            <TammLogo size={40} variant="light" />
            <span style={{
              fontWeight: 800,
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, var(--blue-light), var(--blue-sky))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              تمّ
            </span>
          </Link>
          <p style={{
            color: 'var(--text-second)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            margin: 0,
          }}>
            منصة تمّ لخدمات التكييف والطاقة الشمسية — صيانة وتركيب بأنظمة ذكية وأيدي فنيين محترفين ومعتمدين لراحة منزلك.
          </p>
        </div>

        {/* العمود الثاني: روابط سريعة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--blue-light)' }}>
            روابط سريعة
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <Link href="/home" style={{ color: 'var(--text-second)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-second)'}>
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/store" style={{ color: 'var(--text-second)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-second)'}>
                المتجر الإلكتروني
              </Link>
            </li>
            <li>
              <Link href="/services" style={{ color: 'var(--text-second)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-second)'}>
                خدمات التكييف والطاقة
              </Link>
            </li>
          </ul>
        </div>

        {/* العمود الثالث: الروابط القانونية */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--blue-light)' }}>
            معلومات قانونية
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <a href="https://salehbagomri.github.io/tamm-app-privacy/terms.html" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-second)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-second)'}>
                شروط الاستخدام
              </a>
            </li>
            <li>
              <a href="https://salehbagomri.github.io/tamm-app-privacy/" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-second)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-second)'}>
                سياسة الخصوصية
              </a>
            </li>
          </ul>
        </div>

        {/* العمود الرابع: تواصل معنا */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--blue-light)' }}>
            تواصل معنا
          </h4>
          <p style={{ color: 'var(--text-second)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            للدعم الفني والاستفسارات:
            <br />
            البريد الإلكتروني: <a href="mailto:support@tamm-app.com" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>support@tamm-app.com</a>
          </p>
        </div>
      </div>

      {/* الخط السفلي وحقوق النشر */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <p style={{
          color: 'var(--text-faint)',
          fontSize: '0.8125rem',
          margin: 0,
          textAlign: 'center',
        }}>
          جميع الحقوق محفوظة © {currentYear} منصة تمّ. تطوير شركة تمّ لتقنية المعلومات.
        </p>
      </div>
    </footer>
  )
}
