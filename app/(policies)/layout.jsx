'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PoliciesLayout({ children }) {
  return (
    <div className='min-h-screen pb-16' style={{ background: 'var(--color-content-bg)', color: 'var(--color-content-text)' }}>
      {/* Header */}
      <header className='container mx-auto border-b sticky top-0 z-50 backdrop-blur-md' style={{ borderColor: 'var(--color-content-border)', background: 'rgba(5, 5, 5, 0.8)' }}>
        <div className='px-6 h-20 flex items-center justify-between'>
          <Link href="/" className='flex items-center gap-3 hover:opacity-85 transition-opacity'>
            <img
              src='/gadget-restore-logo.svg'
              alt='Gadget Restore Logo'
              className='h-12 w-auto object-contain'
            />
          </Link>
          <Link href="/checkout/customer-details" className='flex items-center gap-2 text-sm font-semibold hover:text-accent transition-colors' style={{ color: 'var(--color-content-text-secondary)' }}>
            <ArrowLeft size={16} /> Back to Checkout
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-6xl mx-auto px-6 pt-8'>
        {children}
      </main>
    </div>
  )
}
