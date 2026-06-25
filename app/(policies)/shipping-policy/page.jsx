'use client'

import React from 'react'

export default function ShippingPolicy() {
  return (
    <div className='rounded-3xl p-8 lg:p-12 border' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
      <span className='text-[10px] font-bold uppercase tracking-[0.25em] text-accent block mb-3'>LEGAL DOCUMENTS</span>
      <h1 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>Shipping Policy</h1>
      <p className='text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>Last updated: June 24, 2026</p>

      <div className='space-y-8 text-sm leading-relaxed text-zinc-300'>
        <section>
          <h2 className='text-lg font-bold text-white mb-3'>1. Free Pickup & Delivery</h2>
          <p>We offer complimentary pickup and delivery for all smartphone and device repair services within our designated serviceability zones. Input your pincode during scheduling to verify coverage.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Turnaround Times</h2>
          <p>Standard repairs are completed and returned within 24 to 48 hours from the time of pickup. Complex repairs requiring special parts may experience extended delivery times, which will be communicated during diagnostics.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Secure Transit</h2>
          <p>Our delivery partners use tamper-proof containers and packaging. Devices are insured while in transit to and from our service lab.</p>
        </section>
      </div>
    </div>
  )
}
