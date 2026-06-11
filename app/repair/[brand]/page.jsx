import Script from 'next/script'
import {
  Smartphone,
  Monitor,
  Tablet,
  Gamepad,
  Laptop,
  Check,
  Star,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react'
import RepairLandingClient from './RepairLandingClient'
import catalogueService from '@/services/catalogue.service'

// Server-side dynamic metadata generation for SEO
export async function generateMetadata({ params }) {
  const { brand: brandRaw } = await params

  // Handle undefined params (e.g., placeholder pages)
  if (!brandRaw) {
    return {
      title: 'Device Repair Services | Gadget Restore',
      description: 'Professional device repair services',
    }
  }

  const brandName =
    brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase()

  const title = `${brandName} Repair Services — Starting ₹999 | Gadget Restore`
  const description = `Professional, certified ${brandName} repair services. Screen replacements, battery swaps, and motherboard diagnostics starting at ₹999. 90-day warranty & expert engineers.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function BrandRepairPage({ params }) {
  const { brand: brandRaw } = await params

  // Handle undefined or placeholder params
  if (!brandRaw || brandRaw === '_placeholder') {
    return (
      <div className='min-h-screen bg-[#07080e] text-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Page Not Found</h1>
          <p>The brand page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  const brandName =
    brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase()

  // Core structured Schema.org JSON-LD data
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://gadgetrestore.com/#localbusiness',
        name: 'Gadget Restore',
        image: 'https://gadgetrestore.com/gadget-restore-logo.png',
        telephone: '+251-235-3256',
        email: 'support@gadgetrestore.in',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Gadget Restore Tech Hub',
          addressLocality: 'Mumbai',
          addressRegion: 'MH',
          postalCode: '400001',
          addressCountry: 'IN',
        },
        priceRange: '₹₹',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '09:00',
          closes: '18:00',
        },
      },
      {
        '@type': 'Product',
        name: `${brandName} Repair Service`,
        description: `Professional OEM-grade repair solutions for all ${brandName} smartphones, tablets, and laptops.`,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: '999',
          highPrice: '14999',
          offerCount: '18',
        },
      },
    ],
  }

  // Dynamic pricing and brand details fetching from cs-back
  let pricingList = []
  let tiersList = []

  let parsedBrandObj = {
    name: brandName,
    _id:
      brandName === 'Apple'
        ? '65f8c8577adcd9e5c544d673'
        : '65f8c8577adcd9e5c544d674',
    logo:
      brandName === 'Apple'
        ? '/images/apple-logo.png'
        : '/images/samsung-logo.png',
  }

  try {
    const seoData = await catalogueService.getSEOPricing({ brand: brandName })
    if (seoData) {
      if (seoData.brand) {
        parsedBrandObj = {
          name: seoData.brand.name || brandName,
          _id: seoData.brand._id,
          logo: seoData.brand.logo || parsedBrandObj.logo,
        }
      }
      if (seoData.tiers && seoData.tiers.length > 0) {
        tiersList = seoData.tiers
      }
      if (seoData.pricing && seoData.pricing.length > 0) {
        pricingList = seoData.pricing.map((item) => {
          const row = { name: item.name }
          tiersList.forEach((t) => {
            const price = item.prices ? item.prices[t.tier] : null
            row[t.tier] = price
              ? `₹${price.toLocaleString('en-IN')}`
              : 'Estimate Required'
          })
          return row
        })
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic SEO pricing:', error)
  }

  // Fallbacks if tiersList is empty (call failed or DB empty)
  if (tiersList.length === 0) {
    tiersList = [
      { tier: 'Pro', description: 'Pro Quality' },
      { tier: 'Premium', description: 'Premium Quality' },
    ]
  }

  // Fallbacks if pricingList is empty or call failed
  if (pricingList.length === 0) {
    pricingList = [
      {
        name: 'Screen Replacement',
        Original: '₹6,000',
        Pro: '₹2,499',
        Premium: '₹4,199',
        Compatible: '₹1,499',
      },
      {
        name: 'Battery Swap',
        Original: '₹2,500',
        Pro: '₹999',
        Premium: '₹1,699',
        Compatible: '₹799',
      },
      {
        name: 'Charging Port Fix',
        Original: '₹1,999',
        Pro: '₹899',
        Premium: '₹1,499',
        Compatible: '₹699',
      },
      {
        name: 'Back Glass Restoration',
        Original: '₹2,999',
        Pro: '₹1,199',
        Premium: '₹2,199',
        Compatible: '₹999',
      },
      {
        name: 'Camera Module Repair',
        Original: '₹3,999',
        Pro: '₹1,899',
        Premium: '₹2,999',
        Compatible: '₹1,299',
      },
      {
        name: 'Speaker / Audio Repair',
        Original: '₹1,499',
        Pro: '₹799',
        Premium: '₹1,199',
        Compatible: '₹599',
      },
    ]
    pricingList.forEach((row) => {
      tiersList.forEach((t) => {
        if (!row[t.tier]) {
          row[t.tier] = 'Estimate Required'
        }
      })
    })
  }

  return (
    <div className='min-h-screen bg-[#07080e] text-white font-sans selection:bg-[var(--color-accent)] selection:text-white'>
      {/* Schema.org Structured Data */}
      <Script
        id='schema-brand'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* ────────────────────────────────────────────────────────────────────────
          BRAND HERO BANNER
          ──────────────────────────────────────────────────────────────────────── */}
      <section
        className='relative py-24 px-6 lg:px-16 overflow-hidden'
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(108, 123, 255, 0.12) 0%, transparent 60%), linear-gradient(135deg, #090a12 0%, #15162b 100%)',
        }}
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-5 bg-[url('/images/dark-microchip-bg.png')] bg-cover pointer-events-none"></div>
        <div className='max-w-4xl mx-auto relative z-10 text-center lg:text-left'>
          <div className='inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6'>
            <ShieldCheck size={12} /> CERTIFIED RESTORATION SERVICES
          </div>
          <h1 className='text-4xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6'>
            {brandName} Repair <br />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#4cd9ff]'>
              Starting from ₹999
            </span>
          </h1>
          <p className='text-sm lg:text-base text-[var(--color-content-text-secondary)] leading-relaxed mb-10 max-w-[620px]'>
            Professional, OEM-grade repair solutions for all {brandName}{' '}
            smartphones, tablets, and laptops. Swapping screens, restoring
            batteries, and fixing motherboards with dedicated factory
            calibration.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
            <RepairLandingClient
              brandObj={parsedBrandObj}
              step='select-model'
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          PRICING GRID SECTION
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-20 px-6 lg:px-16 bg-[#0b0c15] border-t border-white/5'>
        <div className='max-w-5xl mx-auto'>
          <div className='text-center mb-16'>
            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] block mb-2'>
              SERVICE PRICING INDEX
            </span>
            <h2 className='text-3xl font-black uppercase tracking-wider mb-4'>
              {brandName} Repair Matrix
            </h2>
            <div className='w-16 h-1 bg-[var(--color-accent)] mx-auto rounded-full'></div>
          </div>

          <div className='bg-[#121323] border border-white/5 rounded-3xl overflow-hidden shadow-2xl'>
            <div className='p-6 lg:p-8 border-b border-white/5 bg-white/2 flex justify-between items-center text-xs font-black uppercase tracking-widest text-[var(--color-content-text-secondary)]'>
              <span>Repair Service</span>
              <div className='flex gap-8 lg:gap-12'>
                {tiersList.map((t) => (
                  <span key={t.tier} className='w-24 text-right'>
                    {t.tier}
                  </span>
                ))}
              </div>
            </div>

            <div className='divide-y divide-white/5'>
              {pricingList.map((row, idx) => (
                <div
                  key={idx}
                  className='p-6 lg:p-8 flex justify-between items-center text-xs lg:text-sm hover:bg-white/1 transition-colors'
                >
                  <span className='font-extrabold uppercase tracking-wide text-white'>
                    {row.name}
                  </span>
                  <div className='flex gap-8 lg:gap-12 font-mono text-zinc-300'>
                    {tiersList.map((t) => (
                      <span key={t.tier} className='w-24 text-right'>
                        {row[t.tier]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          GUARANTEE SECTIONS
          ──────────────────────────────────────────────────────────────────────── */}
      <section className='py-20 px-6 lg:px-16 bg-[#111222]'>
        <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left'>
          <div className='bg-[#0b0c16] border border-white/5 p-8 rounded-3xl'>
            <Clock className='text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0' />
            <h3 className='font-extrabold uppercase text-xs tracking-wider mb-2'>
              Same Day Priority
            </h3>
            <p className='text-xs text-[var(--color-content-text-secondary)] leading-relaxed'>
              We diagnose and repair your {brandName} device on-site, completing
              most diagnostic operations in 45-60 minutes.
            </p>
          </div>

          <div className='bg-[#0b0c16] border border-white/5 p-8 rounded-3xl'>
            <ShieldCheck className='text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0' />
            <h3 className='font-extrabold uppercase text-xs tracking-wider mb-2'>
              90-Day Coverage
            </h3>
            <p className='text-xs text-[var(--color-content-text-secondary)] leading-relaxed'>
              Peace of mind is standard. Every single part replacement comes
              loaded with a 90-day coverage warrantying spontaneous issues.
            </p>
          </div>

          <div className='bg-[#0b0c16] border border-white/5 p-8 rounded-3xl'>
            <Star className='text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0' />
            <h3 className='font-extrabold uppercase text-xs tracking-wider mb-2'>
              Certified Specialists
            </h3>
            <p className='text-xs text-[var(--color-content-text-secondary)] leading-relaxed'>
              Our workshop features highly trained hardware engineers using
              clean room tools and calibrated diagnostic micro-soldering.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='bg-[#05060b] border-t border-white/5 py-12 px-6 lg:px-16 text-center text-xs text-[var(--color-content-text-secondary)] font-sans'>
        <p>
          © 2026 GADGET RESTORE INC. TECHNICAL PRECISION. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  )
}
