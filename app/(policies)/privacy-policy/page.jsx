'use client'

import React from 'react'

export default function PrivacyPolicy() {
  return (
    <div className='rounded-3xl p-8 lg:p-12 border' style={{ background: 'var(--color-content-card)', borderColor: 'var(--color-content-border)' }}>
      <span className='text-[10px] font-bold uppercase tracking-[0.25em] text-accent block mb-3'>LEGAL DOCUMENTS</span>
      <h1 className='text-3xl lg:text-5xl font-black tracking-tight mb-8'>Privacy Policy</h1>
      <p className='text-xs mb-10' style={{ color: 'var(--color-content-text-secondary)' }}>Last updated: June 24, 2026</p>

      <div className='space-y-8 text-sm leading-relaxed text-zinc-300'>
        <section>
          <h2 className='text-lg font-bold text-white mb-3'>1. Information We Collect</h2>
          <p className='mb-3'>We collect information that you provide directly to us when booking a repair. This includes your name, email address, phone number, physical address for pickup/delivery, and device authentication credentials (encrypted end-to-end).</p>
          <p>We do not store or access your personal data on the device; password collection is strictly used for diagnostics and post-repair quality assurance.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>2. How We Use Your Information</h2>
          <p className='mb-3'>Your information is utilized solely to facilitate the logistics and completion of your repair order, communicate status updates, and verify warranty eligibility.</p>
          <p>We will never sell or share your data with third-party advertisers.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>3. Data Protection & Encryption</h2>
          <p>All sensitive information, including names, contact details, addresses, and device passwords, is encrypted both in transit and at rest using industry-standard secure hashing algorithms.</p>
        </section>

        <section>
          <h2 className='text-lg font-bold text-white mb-3'>4. Contact Us</h2>
          <p>For questions or requests regarding your data and privacy preferences, please contact our support team at support@gadgetrestore.com.</p>
        </section>
      </div>
    </div>
  )
}
