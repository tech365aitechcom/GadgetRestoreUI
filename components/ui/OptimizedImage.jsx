'use client'

import { useState } from 'react'

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  style = {},
  onError,
  showSkeleton = true,
  skeletonClassName = '',
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = (e) => {
    setHasError(true)
    setIsLoading(false)

    // Try fallback if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    }

    if (onError) {
      onError(e)
    }
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && !hasError && (
        <div
          className={`skeleton ${skeletonClassName}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          loading='lazy'
          decoding='async'
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
          {...props}
        />
      )}

      {/* Error fallback (if no fallbackSrc provided) */}
      {hasError && !fallbackSrc && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--theme-card-darker)',
            color: 'var(--theme-text-tertiary)',
            fontSize: 12,
          }}
        >
          {alt.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}
