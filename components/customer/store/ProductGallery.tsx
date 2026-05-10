'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ProductGalleryProps {
  imageUrl: string | null
  productName: string
}

export default function ProductGallery({ imageUrl, productName }: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div style={{ position: 'sticky', top: '80px' }}>
      <div
        style={{
          position: 'relative', aspectRatio: '1',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: '16px',
          overflow: 'hidden', cursor: imageUrl ? 'zoom-in' : 'default',
        }}
        onMouseEnter={() => imageUrl && setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: 'contain',
              padding: '1.5rem',
              transform: isZoomed ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
            priority
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              borderRadius: '20px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff',
            }}>
              تمّ
            </div>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>
              لا توجد صورة
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
