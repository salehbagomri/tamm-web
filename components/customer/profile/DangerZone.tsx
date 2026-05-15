'use client'

import { useState } from 'react'
import { signOutAction, deleteAccount } from '@/lib/actions/profile'

export default function DangerZone() {
  const [showDialog, setShowDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOutAction()
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    await deleteAccount()
  }

  return (
    <>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid rgba(224,82,82,0.25)',
        borderRadius: '16px', padding: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--error)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--error)', margin: 0 }}>
            منطقة الخطر
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* تسجيل الخروج */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem', backgroundColor: 'var(--bg-surface2)', borderRadius: '12px',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.2rem', fontSize: '0.9375rem' }}>
                تسجيل الخروج
              </p>
              <p style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', margin: 0 }}>
                ستحتاج لتسجيل الدخول مجدداً للوصول لحسابك
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: '10px',
                backgroundColor: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.4)',
                color: 'var(--warning)', fontWeight: 700, fontSize: '0.875rem',
                cursor: signingOut ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {signingOut ? 'جاري الخروج...' : '🚪 تسجيل الخروج'}
            </button>
          </div>

          {/* حذف الحساب */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem', backgroundColor: 'rgba(224,82,82,0.05)', borderRadius: '12px',
            border: '1px solid rgba(224,82,82,0.15)', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.2rem', fontSize: '0.9375rem' }}>
                حذف الحساب نهائياً
              </p>
              <p style={{ color: 'var(--text-faint)', fontSize: '0.8125rem', margin: 0 }}>
                سيتم حذف جميع بياناتك وطلباتك بشكل نهائي
              </p>
            </div>
            <button
              onClick={() => setShowDialog(true)}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: '10px',
                backgroundColor: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.4)',
                color: 'var(--error)', fontWeight: 700, fontSize: '0.875rem',
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              🗑️ حذف الحساب
            </button>
          </div>
        </div>
      </div>

      {/* Dialog تأكيد الحذف */}
      {showDialog && (
        <div
          onClick={() => !deletingAccount && setShowDialog(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(8,14,24,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(224,82,82,0.4)',
              borderRadius: '20px', padding: '2rem',
              maxWidth: '440px', width: '100%',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--error)' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--error)', margin: '0 0 0.75rem' }}>
                حذف الحساب نهائياً
              </h3>
              <p style={{ color: 'var(--text-second)', lineHeight: 1.7, margin: 0 }}>
                هذا الإجراء <strong style={{ color: 'var(--error)' }}>لا يمكن التراجع عنه</strong>.
                سيتم حذف جميع بياناتك وطلباتك نهائياً ولن تتمكن من استعادتها.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                style={{
                  padding: '0.9rem', borderRadius: '12px',
                  backgroundColor: deletingAccount ? 'var(--bg-surface2)' : 'var(--error)',
                  color: deletingAccount ? 'var(--text-faint)' : '#fff',
                  fontWeight: 700, fontSize: '1rem', border: 'none',
                  cursor: deletingAccount ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {deletingAccount ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
              </button>
              <button
                onClick={() => setShowDialog(false)}
                disabled={deletingAccount}
                style={{
                  padding: '0.9rem', borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface2)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem',
                  cursor: deletingAccount ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
