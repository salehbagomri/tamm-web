import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: string
}

// Card wrapper بسيط بألوان تمّ
export default function Card({
  children,
  className,
  style,
  padding = '1.5rem',
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
