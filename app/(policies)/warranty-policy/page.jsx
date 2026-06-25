'use client'

import React from 'react'

export default function WarrantyPolicy() {
  return (
    <div className='rounded-3xl p-8 lg:p-12 border' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
      <span className='text-[10px] font-bold uppercase tracking-[0.25em] text-accent block mb-3'>LEGAL DOCUMENTS</span>
      <h1 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>Warranty Policy</h1>
      <p className='text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>Last updated: June 24, 2026</p>

      <div className='space-y-8 text-sm leading-relaxed text-zinc-300'>
        <section>
          <h2 className='text-lg font-bold text-white mb-3'>1. Warranty Coverage</h2>
          <p>We provide a warranty on parts and labor for repairs completed by Gadget Restore. The warranty duration depends on the select part tier (e.g., standard, premium, or pro tier warranty periods specified during booking).</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Exclusions</h2>
          <p className='mb-3'>The warranty strictly covers defect in material or workmanship of the replaced part. It does not cover:</p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Accidental physical drops or screen cracks after delivery.</li>
            <li>Water or liquid damage.</li>
            <li>Software modifications, rooting, or jailbreaking.</li>
            <li>Repairs attempted by any other party post-service.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. How to Claim</h2>
          <p>To file a warranty claim, please navigate to your Order Details history page and submit a claim, or reach out directly to support with your original ticket number.</p>
        </section>
      </div>
    </div>
  )
}
