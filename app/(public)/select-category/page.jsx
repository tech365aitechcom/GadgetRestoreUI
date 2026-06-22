'use client'

import { useRouter } from 'next/navigation'
import {
  Smartphone,
  Tablet,
  Laptop,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { useBooking } from '@/context/BookingContext'

// ── Real IDs from aidbprod.categories.json + aidbprod.brands.json ──────────
// Each slot has its own Apple brand entry (brands are per-category in the DB).
// Category IDs:  Mobile=67b46b938ffdfd20a19c9da9 | iPad=67b483a0a7c6cc25c6864445 | Laptop=6790c19283c3aeebf3dba734
// Apple Brand IDs: Mobile=68b175cf10113c5d55976da5 | iPad=68b175a710113c5d55975eac | Laptop=68b175b310113c5d5597624e
const SLOTS = [
  {
    id: 'iphone',
    title: 'iPhone',
    description:
      'Expert repair services for all iPhone models — screen, battery, and more.',
    icon: Smartphone,
    bgImage: '/images/pcb3.png',
    brand: {
      _id: '68b175cf10113c5d55976da5',
      name: 'Apple',
      logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912095817-apple.svg',
    },
    category: { _id: '67b46b938ffdfd20a19c9da9', name: 'Mobile' },
  },
  {
    id: 'ipad-tablet',
    title: 'iPad / Tablet',
    description:
      'Screen replacements, battery fixes, and more for all Apple iPad models.',
    icon: Tablet,
    bgImage: '/images/pcb1.png',
    brand: {
      _id: '68b175a710113c5d55975eac',
      name: 'Apple',
      logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912547229-apple.svg',
    },
    category: { _id: '67b483a0a7c6cc25c6864445', name: 'iPad' },
  },
  {
    id: 'mac-pc',
    title: 'Mac / PC',
    description:
      'Hardware upgrades and repairs for MacBooks and Apple desktops.',
    icon: Laptop,
    bgImage: '/images/pcb2.png',
    brand: {
      _id: '68b175b310113c5d5597624e',
      name: 'Apple',
      logo: 'https://cs-portal-documents.s3.ap-south-1.amazonaws.com/brand-logos/1780912570555-apple.svg',
    },
    category: { _id: '6790c19283c3aeebf3dba734', name: 'Laptop' },
  },
]

export default function SelectCategoryPage() {
  const router = useRouter()
  const { reset, setBrand } = useBooking()

  const handleSelectSlot = (slot) => {
    // Reset all booking state first
    reset()
    // Set the correct per-category Apple brand AFTER reset flushes.
    // We pass category via URL param (not context) to avoid the cascade where
    // setCategory() resets brand and setBrand() resets category.
    setTimeout(() => {
      setBrand(slot.brand)
      router.push(
        `/select-model?catId=${slot.category._id}&catName=${encodeURIComponent(slot.category.name)}`,
      )
    }, 0)
  }

  return (
    <div
      className='min-h-screen flex flex-col font-sans'
      style={{
        background: 'var(--color-content-bg)',
        color: 'var(--color-content-text)',
      }}
    >
      {/* ── HERO ── */}
      <section className='pt-14 pb-10 px-6 lg:px-20 text-center'>
        <div
          className='inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase'
          style={{
            background: 'var(--color-accent-tint-10)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-accent-tint-14)',
          }}
        >
          Select Your Device
        </div>
        <h1
          className='text-4xl lg:text-5xl font-black tracking-tight mb-5'
          style={{ color: 'var(--color-content-text)' }}
        >
          What can we fix for you?
        </h1>
        <p
          className='text-sm max-w-xl mx-auto leading-relaxed'
          style={{ color: 'var(--color-content-text-secondary)' }}
        >
          Choose a product category to see available repair services and
          pricing. Our certified Apple technicians are ready to help.
        </p>
      </section>

      {/* ── CATEGORIES GRID ── */}
      <section className='pb-24 px-6 lg:px-20 flex-1'>
        <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
          {SLOTS.map((slot) => {
            const Icon = slot.icon
            return (
              <button
                key={slot.id}
                onClick={() => handleSelectSlot(slot)}
                className='group text-left rounded-[20px] overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer focus:outline-none'
                style={{
                  background: 'var(--color-content-card)',
                  borderColor: 'var(--color-content-border)',
                  boxShadow: 'var(--theme-shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px var(--color-accent-shadow-10)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    'var(--color-content-border)'
                  e.currentTarget.style.boxShadow = 'var(--theme-shadow-sm)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Image area — white bg so images look bright & clear */}
                <div className='h-52 w-full relative overflow-hidden bg-white flex items-center justify-center'>
                  <img
                    src={slot.bgImage}
                    alt={slot.title}
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
                </div>
                {/* Card body */}
                <div className='p-6 flex-1 flex flex-col justify-between relative'>
                  {/* Arrow badge on hover */}
                  <div
                    className='absolute -top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </div>

                  <div>
                    <h3
                      className='text-lg font-black tracking-wide mb-2 transition-colors'
                      style={{ color: 'var(--color-content-text)' }}
                    >
                      {slot.title}
                    </h3>
                    <p
                      className='text-xs leading-relaxed font-medium'
                      style={{ color: 'var(--color-content-text-secondary)' }}
                    >
                      {slot.description}
                    </p>
                  </div>

                  {/* CTA label */}
                  <div
                    className='mt-5 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    View Models <ChevronRight size={12} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
