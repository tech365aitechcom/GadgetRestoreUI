'use client'

import { useState, useMemo } from 'react'
import { Search, Smartphone } from 'lucide-react'
import { useBooking } from '@/context/BookingContext';

/* ══════════════════════════════════════════════════════════════════════════
   MODEL LIST / GRID
   Requirements: 2-col mobile, 4–5 col desktop. Image + name + model number.
   Search filters in real time (<300ms). 
   ══════════════════════════════════════════════════════════════════════════ */
export default function ModelList({
  models = [],
  brandName = '',
  isLoading,
  onSelectModel,
  selectedModelId,
}) {
  const [search, setSearch] = useState('')
  const { brand } = useBooking();
  const filtered = useMemo(() => {
    if (!search.trim()) return models
    const q = search.toLowerCase()
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.modelNumber && m.modelNumber.toLowerCase().includes(q)) ||
        (m.index && String(m.index).toLowerCase().includes(q)),
    )
  }, [models, search])

  const getModelSubtext = (model) => {
    if (model.modelNumber) return model.modelNumber
    if (model.index) return `A${model.index}`
    if (model.year) return String(model.year)
    return ''
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
      }}
    >
      {/* Search */}
      <div className='search-input-row'>
        <Search size={17} color='var(--color-content-text-secondary)' />
        <input
          type='text'
          placeholder='Search iPhone model...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete='off'
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-content-text-secondary)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='skeleton model-grid-skeleton' />
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div
          className='model-grid-inner'
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20, // Increased gap for proper spacing matching the design
          }}
        >
          {filtered.map((model) => {
            const isSelected = selectedModelId === model._id
            const subtext = getModelSubtext(model)

            // Clean up name by removing brandName prefix dynamically (e.g. "Apple iPhone 11" -> "iPhone 11")
            const displayName = brand?.name && model.name.toLowerCase().startsWith(brand?.name?.toLowerCase())
              ? model.name.slice(brand?.name?.length).trim()
              : model.name;

            const isApple = brand?.name?.toLowerCase() === 'apple'
            const defaultImage = isApple ? '/images/default-apple.png' : '/images/default-android.png'
            return (
              <button
                key={model._id}
                className={`model-card${isSelected ? ' selected' : ''}`}
                onClick={() => onSelectModel(model)}
                aria-pressed={isSelected}
              >
                {/* Image area */}
                <div className='model-card-image'>
                  <img
                    src={model.image || defaultImage}
                    alt={model.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    loading='lazy'
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + defaultImage) {
                        e.target.src = defaultImage;
                      }
                    }}
                  />
                </div>

                {/* Info Area (Name & Code grouped together) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
                  <span className='model-card-name'>{displayName}</span>
                  {subtext && <span className='model-card-id'>{subtext}</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: 'var(--color-content-text-secondary)',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            No models found
          </div>
          <div style={{ fontSize: 13 }}>No results for "{search}"</div>
        </div>
      )}
    </div>
  )
}
