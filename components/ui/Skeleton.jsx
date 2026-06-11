'use client'

export default function Skeleton({ className = '', circle = false, lines }) {
  if (lines && lines > 1) {
    return (
      <div className='flex flex-col gap-2 w-full'>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`${className} ${i === lines - 1 ? 'w-[70%]' : 'w-full'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`skeleton shrink-0 ${circle ? 'rounded-full' : 'rounded-[var(--radius-sm)]'} ${className}`}
      aria-hidden='true'
    />
  )
}

export function SkeletonCard() {
  return (
    <div className='card flex flex-col gap-3'>
      <div className='flex items-center gap-3'>
        <Skeleton circle className='w-10 h-10' />
        <div className='flex-1 flex flex-col gap-1.5'>
          <Skeleton className='h-3.5 w-3/5' />
          <Skeleton className='h-3 w-2/5' />
        </div>
      </div>
      <Skeleton className='h-3 w-full' />
      <Skeleton className='h-3 w-4/5' />
    </div>
  )
}
