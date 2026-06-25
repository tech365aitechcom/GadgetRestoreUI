'use client'

import React from 'react'

export default function TermsAndConditions() {
  return (
    <div className='rounded-3xl p-8 lg:p-12 border' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
      <span className='text-[10px] font-bold uppercase tracking-[0.25em] text-accent block mb-3'>LEGAL DOCUMENTS</span>
      <h1 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>Terms & Conditions</h1>
      <p className='text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>Last updated: June 24, 2026</p>

      <div className='space-y-8 text-sm leading-relaxed text-zinc-300'>
        <section>
          <h2 className='text-lg font-bold text-white mb-3'>1. Repair Authorization</h2>
          <p>By scheduling a repair, you authorize Gadget Restore to perform the diagnostics and repair services requested. We are not responsible for any data loss, and highly recommend backing up your device prior to handing it over.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. Diagnostics & Quote Approvals</h2>
          <p>Once diagnostics are completed, we will notify you of the confirmed issue and final cost. Repair work will not proceed without your explicit approval. If you decline the repair, a diagnostic fee may apply.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Device Abandonment</h2>
          <p>Devices left with us for more than 90 days after repair completion or diagnostic notification without payment or contact may be disposed of or sold to recover cost of parts and labor.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Liability Limitation</h2>
          <p>Gadget Restore is not liable for pre-existing damage, software failures, or subsequent issues unrelated to the specific part repaired. Our liability is limited strictly to the cost of the repair performed.</p>
        </section>
      </div>
    </div>
  )
}
