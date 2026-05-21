'use client'

export default function PrintInvoiceButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <button 
      onClick={handlePrint}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--blue-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(21, 118, 212, 0.3)',
      }}
    >
      <span>🖨️</span>
      طباعة الفاتورة / تحميل PDF
    </button>
  )
}
