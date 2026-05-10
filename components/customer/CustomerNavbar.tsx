// Customer Navbar — Placeholder للمرحلة الأولى
// سيُطور بالكامل في المرحلة التالية

export default function CustomerNavbar() {
  return (
    <nav
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* الشعار */}
      <span
        style={{
          fontWeight: 700,
          fontSize: '1.25rem',
          color: 'var(--blue-light)',
        }}
      >
        تمّ
      </span>

      {/* روابط التنقل — Placeholder */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          color: 'var(--text-second)',
          fontSize: '0.9rem',
        }}
      >
        <span>الرئيسية</span>
        <span>المتجر</span>
        <span>الخدمات</span>
        <span>طلباتي</span>
      </div>

      {/* أيقونة المستخدم — Placeholder */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--blue-mid)',
          border: '2px solid var(--blue-primary)',
        }}
      />
    </nav>
  )
}
