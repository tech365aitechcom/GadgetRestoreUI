'use client';

import { useState, useMemo } from 'react';
import { Search, Smartphone } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════
   MODEL LIST / GRID
   Requirements: 2-col mobile, 4–5 col desktop. Image + name + model number.
   Search filters in real time (<300ms). 
   ══════════════════════════════════════════════════════════════════════════ */
export default function ModelList({ models = [], isLoading, onSelectModel, selectedModelId }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return models;
    const q = search.toLowerCase();
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.modelNumber && m.modelNumber.toLowerCase().includes(q)) ||
        (m.index && String(m.index).toLowerCase().includes(q))
    );
  }, [models, search]);

  const getModelSubtext = (model) => {
    if (model.modelNumber) return model.modelNumber;
    if (model.index)       return `A${model.index}`;
    if (model.year)        return String(model.year);
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>

      {/* Search */}
      <div className="search-input-row">
        <Search size={17} color="var(--color-content-text-secondary)" />
        <input
          type="text"
          placeholder="Search iPhone model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-content-text-secondary)', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton model-grid-skeleton" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="model-grid-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {filtered.map((model) => {
            const isSelected = selectedModelId === model._id;
            const subtext    = getModelSubtext(model);
            const hasImage   = model.images && model.images[0];

            return (
              <button
                key={model._id}
                className={`model-card${isSelected ? ' selected' : ''}`}
                onClick={() => onSelectModel(model)}
                aria-pressed={isSelected}
              >
                {/* Image area */}
                <div className="model-card-image">
                  {hasImage ? (
                    <img
                      src={model.images[0]}
                      alt={model.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: hasImage ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      color: 'var(--color-content-text-secondary)',
                    }}
                  >
                    <Smartphone size={36} />
                  </div>
                </div>

                {/* Name */}
                <span className="model-card-name">{model.name}</span>

                {/* Model number / year */}
                {subtext && <span className="model-card-id">{subtext}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-content-text-secondary)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No models found</div>
          <div style={{ fontSize: 13 }}>No results for "{search}"</div>
        </div>
      )}
    </div>
  );
}
