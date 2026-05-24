'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

interface ProductGalleryProps {
  imageUrl: string | null
  productName: string
  isFeatured?: boolean
  oldPrice?: number | null
  price?: number | null
  category?: string
}

interface GalleryItem {
  id: number
  label: string
  url: string
  styleType: 'default' | 'studio' | 'blueprint'
}

export default function ProductGallery({
  imageUrl,
  productName,
  isFeatured = false,
  oldPrice = null,
  price = null,
  category = '',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})

  const mainImageRef = useRef<HTMLDivElement>(null)
  const mobileContainerRef = useRef<HTMLDivElement>(null)

  // Generate three custom perspectives/perspectives of the single product image to create a rich gallery.
  const galleryItems: GalleryItem[] = imageUrl
    ? [
        { id: 0, label: 'الرئيسية', url: imageUrl, styleType: 'default' },
        { id: 1, label: 'لقطة استوديو', url: imageUrl, styleType: 'studio' },
        { id: 2, label: 'مخطط فني', url: imageUrl, styleType: 'blueprint' },
      ]
    : []

  const hasDiscount = oldPrice && price && price < oldPrice
  const discountPct = hasDiscount ? Math.round((1 - price! / oldPrice!) * 100) : null

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, galleryItems.length])

  // Mouse pan zoom calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  // Handle mobile horizontal scroll snapping detection
  const handleMobileScroll = () => {
    if (!mobileContainerRef.current) return
    const container = mobileContainerRef.current
    const scrollLeft = container.scrollLeft
    const width = container.clientWidth
    // In RTL, scrollLeft is negative or positive depending on browser implementation,
    // so we use absolute value for calculation.
    const scrollIndex = Math.round(Math.abs(scrollLeft) / width)
    if (scrollIndex >= 0 && scrollIndex < galleryItems.length && scrollIndex !== activeIndex) {
      setActiveIndex(scrollIndex)
    }
  }

  // Sync scroll position when activeIndex changes on mobile
  const scrollToMobileImage = (idx: number) => {
    if (!mobileContainerRef.current) return
    const container = mobileContainerRef.current
    const width = container.clientWidth
    // RTL scroll adjustment
    const isRtl = document.dir === 'rtl'
    container.scrollTo({
      left: isRtl ? -width * idx : width * idx,
      behavior: 'smooth',
    })
  }

  const selectItem = (idx: number) => {
    setActiveIndex(idx)
    scrollToMobileImage(idx)
  }

  // Shimmer pulse loader callback
  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="product-gallery-root" style={{ position: 'sticky', top: '6rem', zIndex: 10 }}>
      {/* Dynamic CSS injecting via <style> to handle responsiveness & animations */}
      <style>{`
        .product-gallery-root {
          width: 100%;
        }
        
        .main-viewer-wrapper {
          position: relative;
          aspect-ratio: 1;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          cursor: zoom-in;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .main-viewer-wrapper:hover {
          border-color: var(--blue-primary);
        }

        .gallery-image-element {
          object-fit: contain;
          padding: 2.25rem;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }

        .perspective-studio {
          background: radial-gradient(circle at center, rgba(21, 118, 212, 0.16) 0%, rgba(8, 14, 24, 0) 70%), var(--bg-surface);
        }

        .perspective-blueprint {
          background-color: var(--bg-surface);
          background-image: 
            linear-gradient(rgba(26, 46, 68, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26, 46, 68, 0.3) 1px, transparent 1px);
          background-size: 24px 24px;
          background-position: center;
        }

        .blueprint-tint {
          filter: sepia(100%) hue-rotate(190deg) saturate(300%) brightness(85%);
        }

        /* Responsive Mobile layout modifications */
        @media (max-width: 768px) {
          .main-viewer-wrapper {
            display: none !important;
          }
          
          .mobile-snap-container {
            display: flex !important;
            width: 100%;
            aspect-ratio: 1.1;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            background-color: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            -webkit-overflow-scrolling: touch;
          }
          
          .mobile-snap-slide {
            flex-shrink: 0;
            width: 100%;
            height: 100%;
            scroll-snap-align: start;
            position: relative;
            overflow: hidden;
          }

          .thumbnail-strip-desktop {
            display: none !important;
          }

          .mobile-dots-container {
            display: flex !important;
          }
        }

        /* Pulse loading shimmer */
        .shimmer-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-surface2) 50%, var(--bg-surface) 75%);
          background-size: 200% 100%;
          animation: shimmer-anim 1.5s infinite;
          z-index: 1;
        }

        @keyframes shimmer-anim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Glassmorphism badges styling */
        .glass-badge {
          position: absolute;
          z-index: 10;
          top: 1rem;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          font-size: 0.8125rem;
          font-weight: 700;
          padding: 0.375rem 0.875rem;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .badge-featured {
          right: 1rem;
          background-color: rgba(245, 166, 35, 0.18);
          color: var(--warning);
          border: 1px solid rgba(245, 166, 35, 0.35);
        }

        .badge-discount {
          left: 1rem;
          background-color: rgba(224, 82, 82, 0.18);
          color: var(--error);
          border: 1px solid rgba(224, 82, 82, 0.35);
        }
      `}</style>

      {imageUrl ? (
        <>
          {/* ── Desktop Main Image ── */}
          <div
            ref={mainImageRef}
            className={`main-viewer-wrapper perspective-${galleryItems[activeIndex].styleType}`}
            onClick={() => setLightboxOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            {/* Shimmer loading mask */}
            {!loadedImages[activeIndex] && <div className="shimmer-bg" />}

            {/* Badges overlay */}
            {isFeatured && (
              <span className="glass-badge badge-featured">
                <span>⭐</span>
                <span>مميز</span>
              </span>
            )}
            {discountPct && (
              <span className="glass-badge badge-discount">
                <span>🔥</span>
                <span>خصم {discountPct}%</span>
              </span>
            )}

            <Image
              src={galleryItems[activeIndex].url}
              alt={`${productName} - ${galleryItems[activeIndex].label}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoad={() => handleImageLoad(activeIndex)}
              className={`gallery-image-element ${
                galleryItems[activeIndex].styleType === 'blueprint' ? 'blueprint-tint' : ''
              }`}
              style={{
                transform: isZoomed ? 'scale(1.15)' : 'scale(1)',
                transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center center',
              }}
              priority
            />
          </div>

          {/* ── Mobile Swipable Carousel ── */}
          <div
            ref={mobileContainerRef}
            className="mobile-snap-container"
            onScroll={handleMobileScroll}
            style={{ display: 'none' }}
          >
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className={`mobile-snap-slide perspective-${item.styleType}`}
                onClick={() => setLightboxOpen(true)}
              >
                {!loadedImages[item.id] && <div className="shimmer-bg" />}

                {/* Badges overlay on mobile slide */}
                {isFeatured && idx === 0 && (
                  <span className="glass-badge badge-featured">
                    <span>⭐</span>
                    <span>مميز</span>
                  </span>
                )}
                {discountPct && idx === 0 && (
                  <span className="glass-badge badge-discount">
                    <span>🔥</span>
                    <span>خصم {discountPct}%</span>
                  </span>
                )}

                <Image
                  src={item.url}
                  alt={`${productName} - ${item.label}`}
                  fill
                  sizes="100vw"
                  onLoad={() => handleImageLoad(item.id)}
                  className={`gallery-image-element ${
                    item.styleType === 'blueprint' ? 'blueprint-tint' : ''
                  }`}
                />
              </div>
            ))}
          </div>

          {/* ── Mobile Dots Indicator ── */}
          <div
            className="mobile-dots-container"
            style={{
              display: 'none',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => selectItem(idx)}
                style={{
                  width: activeIndex === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '99px',
                  backgroundColor: activeIndex === idx ? 'var(--blue-primary)' : 'var(--border)',
                  border: 'none',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* ── Interactive Thumbnails (Desktop Only) ── */}
          <div
            className="thumbnail-strip-desktop"
            style={{
              display: 'flex',
              gap: '0.875rem',
              marginTop: '1.25rem',
              justifyContent: 'flex-start',
            }}
          >
            {galleryItems.map((item, idx) => {
              const isSelected = activeIndex === idx
              return (
                <button
                  key={item.id}
                  onClick={() => selectItem(idx)}
                  onMouseEnter={() => selectItem(idx)}
                  className={`perspective-${item.styleType}`}
                  style={{
                    position: 'relative',
                    width: '76px',
                    height: '76px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid var(--blue-primary)' : '1px solid var(--border)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(21,118,212,0.15)' : 'none',
                    padding: 0,
                  }}
                >
                  <Image
                    src={item.url}
                    alt={item.label}
                    fill
                    sizes="80px"
                    className={item.styleType === 'blueprint' ? 'blueprint-tint' : ''}
                    style={{
                      objectFit: 'contain',
                      padding: '0.5rem',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  />
                  {/* Perspective badge in thumbnails */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      fontSize: '0.55rem',
                      backgroundColor: 'rgba(8, 14, 24, 0.75)',
                      color: 'var(--text-second)',
                      padding: '1px 0',
                      textAlign: 'center',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        /* Empty State */
        <div
          style={{
            aspectRatio: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-mid))',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            تمّ
          </div>
          <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>لا توجد صورة</span>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {lightboxOpen && imageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 8, 15, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem', // RTL Close Button on left side
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: '#fff',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error)'
              e.currentTarget.style.borderColor = 'var(--error)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            ✕
          </button>

          {/* Previous Arrow (Right in RTL) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1))
            }}
            style={{
              position: 'absolute',
              right: '2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              color: '#fff',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--blue-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          >
            ➔
          </button>

          {/* Main Lightbox Content */}
          <div
            style={{
              position: 'relative',
              width: '85vw',
              height: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`perspective-${galleryItems[activeIndex].styleType}`}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={galleryItems[activeIndex].url}
                alt={`${productName} - Lightbox`}
                fill
                style={{ objectFit: 'contain', padding: '2rem' }}
                className={galleryItems[activeIndex].styleType === 'blueprint' ? 'blueprint-tint' : ''}
              />
            </div>
            
            {/* Floating label inside lightbox */}
            <span
              style={{
                position: 'absolute',
                bottom: '-2.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'var(--text-second)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {galleryItems[activeIndex].label} ({activeIndex + 1} / {galleryItems.length})
            </span>
          </div>

          {/* Next Arrow (Left in RTL) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0))
            }}
            style={{
              position: 'absolute',
              left: '2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              color: '#fff',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--blue-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          >
            ←
          </button>
        </div>
      )}
    </div>
  )
}
