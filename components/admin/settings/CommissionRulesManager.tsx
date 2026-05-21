'use client'

import { useState } from 'react'
import type { CommissionRule, TaskType, CommissionType } from '@/lib/types/commission'
import { TASK_TYPE_LABELS, COMMISSION_TYPE_LABELS } from '@/lib/types/commission'
import { upsertCommissionRule, toggleCommissionRule } from '@/lib/actions/admin/commissions'
import { useRouter } from 'next/navigation'

interface Props {
  initialRules: CommissionRule[]
}

export default function CommissionRulesManager({ initialRules }: Props) {
  const [rules, setRules] = useState(initialRules)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleToggle = async (ruleId: string, isActive: boolean) => {
    setSaving(true)
    const res = await toggleCommissionRule(ruleId, !isActive)
    if (!res.error) {
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !isActive } : r))
    }
    setSaving(false)
  }

  const handleSaveValue = async (rule: CommissionRule) => {
    const newValue = parseFloat(editValue)
    if (isNaN(newValue) || newValue < 0) return
    setSaving(true)
    const res = await upsertCommissionRule({
      id: rule.id,
      taskType: rule.taskType,
      commissionType: rule.commissionType,
      value: newValue,
      description: rule.description ?? undefined,
      isActive: rule.isActive,
    })
    if (!res.error) {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: newValue } : r))
      setEditing(null)
    }
    setSaving(false)
    router.refresh()
  }

  const calcExample = (rule: CommissionRule): string => {
    if (rule.commissionType === 'fixed_amount') {
      return `عمولة الفني = ${rule.value.toFixed(0)} ر.س (ثابت)`
    }
    const exAmount = 500
    const commission = (exAmount * rule.value) / 100
    return `مثال: طلب ${exAmount} ر.س → عمولة الفني = ${commission.toFixed(0)} ر.س (${rule.value}%)`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {rules.map(rule => (
        <div key={rule.id} style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${rule.isActive ? 'var(--border)' : 'var(--text-faint)'}`,
          borderRadius: '14px',
          padding: '1.25rem',
          opacity: rule.isActive ? 1 : 0.5,
          transition: 'opacity 0.2s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: rule.isActive ? 'rgba(34,201,138,0.15)' : 'rgba(126,126,126,0.15)',
                color: rule.isActive ? 'var(--success)' : 'var(--text-faint)',
                marginLeft: '0.5rem',
              }}>
                {rule.isActive ? 'مفعّلة' : 'معطّلة'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                {TASK_TYPE_LABELS[rule.taskType]}
              </span>
            </div>
            <button
              onClick={() => handleToggle(rule.id, rule.isActive)}
              disabled={saving}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface2)',
                color: 'var(--text-second)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {rule.isActive ? 'تعطيل' : 'تفعيل'}
            </button>
          </div>

          {rule.description && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-second)' }}>
              {rule.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
              النوع: {COMMISSION_TYPE_LABELS[rule.commissionType]}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>|</span>

            {editing === rule.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{
                    width: '80px',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--blue-primary)',
                    backgroundColor: 'var(--bg-surface2)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => handleSaveValue(rule)}
                  disabled={saving}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >حفظ</button>
                <button
                  onClick={() => setEditing(null)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-second)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >إلغاء</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--blue-light)',
                }}>
                  {rule.value}{rule.commissionType === 'percentage' ? '%' : ' ر.س'}
                </span>
                <button
                  onClick={() => { setEditing(rule.id); setEditValue(String(rule.value)) }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >تعديل</button>
              </div>
            )}
          </div>

          <p style={{
            margin: '0.75rem 0 0',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-surface2)',
            fontSize: '0.8rem',
            color: 'var(--text-second)',
          }}>
            {calcExample(rule)}
          </p>
        </div>
      ))}
    </div>
  )
}
