import AdminSidebar from '@/components/admin/AdminSidebar'

// Layout للمدير — مع Sidebar جانبي
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
