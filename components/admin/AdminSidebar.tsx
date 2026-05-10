// Admin Sidebar — Placeholder للمرحلة الأولى
// سيُطور بالكامل في المرحلة التالية

const navItems = [
  { label: 'لوحة التحكم', path: '/admin/dashboard' },
  { label: 'الطلبات', path: '/admin/orders' },
  { label: 'المنتجات', path: '/admin/products' },
  { label: 'الخدمات', path: '/admin/services' },
  { label: 'الفنيون', path: '/admin/technicians' },
  { label: 'عروض الأسعار', path: '/admin/quotes' },
]

export default function AdminSidebar() {
  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* شعار لوحة التحكم */}
      <div
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--blue-light)',
          }}
        >
          تمّ — المدير
        </span>
      </div>

      {/* عناصر التنقل */}
      {navItems.map((item) => (
        <div
          key={item.path}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '8px',
            color: 'var(--text-second)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {item.label}
        </div>
      ))}
    </aside>
  )
}
