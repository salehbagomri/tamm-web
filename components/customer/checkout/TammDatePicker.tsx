'use client'

import React, { useState } from 'react'

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

// Sunday first — matches getDay() returning 0=Sun … 6=Sat, displayed RTL
const DAY_NAMES = ['أح', 'ان', 'ثل', 'أر', 'خم', 'جم', 'سب']

interface TammDatePickerProps {
  value: Date | null
  onChange: (date: Date) => void
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export default function TammDatePicker({ value, onChange }: TammDatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth())

  const isAtMinMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()

  function goToPrev() {
    if (isAtMinMonth) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function goToNext() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  // Build grid: leading nulls for offset, then day numbers 1..N
  const startOffset = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function handleSelect(day: number) {
    const date = new Date(viewYear, viewMonth, day)
    date.setHours(0, 0, 0, 0)
    if (date < today) return
    onChange(date)
  }

  const NavBtn = ({
    onClick, disabled, children,
  }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      style={{
        width: '32px', height: '32px', borderRadius: '8px',
        border: '1px solid var(--border)',
        backgroundColor: disabled ? 'var(--bg-surface2)' : 'var(--bg-surface)',
        color: disabled ? 'var(--text-faint)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 0.15s, color 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface2)'
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface)'
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1rem',
      userSelect: 'none',
    }}>
      {/* Header: in RTL flex — first child = right, second child = left */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        {/* Month + year label — appears on the RIGHT in RTL */}
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {ARABIC_MONTHS[viewMonth]} {viewYear}
        </span>

        {/* Navigation buttons — appear on the LEFT in RTL */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {/* In RTL: right-pointing chevron = navigate to previous (earlier) month */}
          <NavBtn onClick={goToPrev} disabled={isAtMinMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </NavBtn>
          {/* In RTL: left-pointing chevron = navigate to next (later) month */}
          <NavBtn onClick={goToNext}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </NavBtn>
        </div>
      </div>

      {/* Day name headers — grid flows RTL so أح (Sun) appears on the right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.375rem' }}>
        {DAY_NAMES.map((name) => (
          <div key={name} style={{
            textAlign: 'center', fontSize: '0.725rem',
            color: 'var(--text-faint)', fontWeight: 600, padding: '0.25rem 0',
          }}>
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} style={{ width: '40px', height: '40px' }} />

          const cellDate = new Date(viewYear, viewMonth, day)
          cellDate.setHours(0, 0, 0, 0)
          const isPast = cellDate < today
          const isToday = sameDay(cellDate, today)
          const isSelected = value !== null && sameDay(cellDate, value)

          return (
            <div
              key={idx}
              onClick={() => !isPast && handleSelect(day)}
              style={{
                width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                margin: '0 auto',
                fontSize: '0.875rem', fontWeight: 500,
                cursor: isPast ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s, color 0.15s',
                backgroundColor: isSelected ? 'var(--blue-primary)' : 'transparent',
                color: isSelected ? '#fff' : isPast ? 'var(--text-faint)' : 'var(--text-primary)',
                border: isToday && !isSelected
                  ? '2px solid var(--blue-primary)'
                  : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isPast && !isSelected) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-surface2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                }
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
