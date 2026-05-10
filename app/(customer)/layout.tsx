import CustomerNavbar from '@/components/customer/CustomerNavbar'

// Layout للعملاء — مع Navbar علوي ثابت
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <CustomerNavbar />
      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {children}
      </main>
    </div>
  )
}
