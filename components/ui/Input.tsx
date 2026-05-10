'use client'

import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightElement, id, style, ...props }, ref) => {
    const inputId = id ?? `input-${label}`

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ color: 'var(--text-second)', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            id={inputId}
            style={{
              width: '100%',
              padding: rightElement ? '0.75rem 1rem 0.75rem 3rem' : '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface2)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: error ? '0 0 0 3px rgba(224,82,82,0.12)' : 'none',
              ...style,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--blue-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(21,118,212,0.15)'
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
            {...props}
          />
          {rightElement && (
            <div
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p style={{ color: 'var(--error)', fontSize: '0.8125rem', margin: 0 }}>{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
