import Script from 'next/script';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Gamepad, 
  Laptop, 
  Check, 
  Star, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
import RepairLandingClient from '../RepairLandingClient';

// Helper to check if a slug is a repair type or a device model
function parseSlug(slug) {
  const normalized = slug.toLowerCase();
  const repairKeywords = [
    'screen-replacement', 'screen', 'display', 'glass',
    'battery-replacement', 'battery', 'charge', 'charging-port',
    'back-glass', 'rear-glass', 'camera', 'camera-repair',
    'speaker', 'mic', 'audio', 'sound', 'buttons', 'power-button'
  ];

  const isRepairType = repairKeywords.some(keyword => normalized.includes(keyword));
  
  // Format slug to readable name
  let formatted = slug
    .split('-')
    .map(word => {
      if (word === 'iphone' || word === 'ipad' || word === 'macbook') {
        return word.charAt(0).toLowerCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  // Fix capitalization anomalies for well-known terms
  formatted = formatted
    .replace(/Iphone/g, 'iPhone')
    .replace(/Ipad/g, 'iPad')
    .replace(/Macbook/g, 'MacBook');

  return { isRepairType, name: formatted };
}

// Server-side dynamic metadata generation for SEO
export async function generateMetadata({ params }) {
  const brandRaw = await params.brand;
  const slugRaw = await params.slug;

  // Handle undefined params (e.g., placeholder pages)
  if (!brandRaw || !slugRaw) {
    return {
      title: 'Device Repair Services | Gadget Restore',
      description: 'Professional device repair services',
    }
  }

  const brandName = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase();
  
  const parsed = parseSlug(slugRaw);
  
  let title = '';
  let description = '';
  
  if (parsed.isRepairType) {
    const startingPrice = parsed.name.toLowerCase().includes('screen') ? '1,999' : '999';
    title = `${brandName} ${parsed.name} Services — Starting ₹${startingPrice} | Gadget Restore`;
    description = `Professional, certified ${brandName} ${parsed.name.toLowerCase()} services. Premium parts, expert micro-soldering, and detailed calibrations starting at ₹${startingPrice}. 90-day warranty included.`;
  } else {
    title = `${brandName} ${parsed.name} Repair Services — Starting ₹999 | Gadget Restore`;
    description = `OEM-grade screen replacement, battery swap, and motherboard repairs for ${brandName} ${parsed.name}. High-fidelity calibration starting at ₹999 with a 90-day warranty.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  };
}

export default async function ModelOrRepairPage({ params }) {
  const brandRaw = await params.brand;
  const slugRaw = await params.slug;

  // Handle undefined params (e.g., placeholder pages) - redirect or show error
  if (!brandRaw || !slugRaw || brandRaw === '_placeholder' || slugRaw === '_placeholder') {
    return (
      <div className="min-h-screen bg-[#07080e] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p>The repair page you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const brandName = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase();
  const parsed = parseSlug(slugRaw);

  const startingPrice = parsed.isRepairType 
    ? (parsed.name.toLowerCase().includes('screen') ? '1,999' : '999')
    : '999';

  // Core structured Schema.org JSON-LD data
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://gadgetrestore.com/#localbusiness",
        "name": "Gadget Restore",
        "image": "https://gadgetrestore.com/gadget-restore-logo.png",
        "telephone": "+251-235-3256",
        "email": "info@techfixpro.com",
        "priceRange": "₹₹",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gadget Restore Tech Hub",
          "addressLocality": "Mumbai",
          "addressRegion": "MH",
          "postalCode": "400001",
          "addressCountry": "IN"
        }
      },
      {
        "@type": "Product",
        "name": parsed.isRepairType 
          ? `${brandName} ${parsed.name}` 
          : `${brandName} ${parsed.name} Repair Service`,
        "description": parsed.isRepairType 
          ? `Premium ${parsed.name.toLowerCase()} solutions for ${brandName} devices.`
          : `Comprehensive hardware diagnostics, screen swaps, and battery replacements for ${brandName} ${parsed.name}.`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": startingPrice.replace(',', ''),
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
      }
    ]
  };

  // Prefilled payloads
  const parsedBrandObj = {
    name: brandName,
    _id: brandName === 'Apple' ? '65f8c8577adcd9e5c544d673' : '65f8c8577adcd9e5c544d674',
    logo: brandName === 'Apple' ? '/images/apple-logo.png' : '/images/samsung-logo.png'
  };

  const parsedModelObj = parsed.isRepairType ? null : {
    name: parsed.name,
    _id: '65f8c8577adcd9e5c544d675', // mock model ID prefilled
    images: ['/images/iphone-15.png']
  };

  return (
    <div className="min-h-screen bg-[#07080e] text-white font-sans selection:bg-[var(--color-accent)] selection:text-white">
      {/* Schema.org Structured Data */}
      <Script
        id="schema-dynamic-detail"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* ────────────────────────────────────────────────────────────────────────
          HERO BANNER
          ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-16 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(108, 123, 255, 0.12) 0%, transparent 60%), linear-gradient(135deg, #090a12 0%, #15162b 100%)'
        }}
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-5 bg-[url('/images/dark-microchip-bg.png')] bg-cover pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6">
            <ShieldCheck size={12} /> FACTORY STANDARD RESTORATION
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
            {parsed.isRepairType 
              ? `${brandName} ${parsed.name}`
              : `${brandName} ${parsed.name} Repair`
            } <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#4cd9ff]">
              Starting from ₹{startingPrice}
            </span>
          </h1>

          <p className="text-sm lg:text-base text-[var(--color-content-text-secondary)] leading-relaxed mb-10 max-w-[620px]">
            {parsed.isRepairType
              ? `Professional ${parsed.name.toLowerCase()} services for all ${brandName} models. Restoring high refresh rates, battery health, and tactile response with detailed OEM calibrations.`
              : `Premium screen swaps, high-capacity battery replacements, and certified hardware debugging for your ${brandName} ${parsed.name}. Each diagnosis is backed by certified workshop engineers.`
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <RepairLandingClient 
              brandObj={parsedBrandObj} 
              modelObj={parsedModelObj}
              step={parsed.isRepairType ? 'select-model' : 'select-symptoms'} 
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────────
          PRICING TABLE
          ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-[#0b0c15] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] block mb-2">UPFRONT RATES</span>
            <h2 className="text-3xl font-black uppercase tracking-wider mb-4">
              {parsed.isRepairType ? `${parsed.name} Catalog` : `${parsed.name} Repair Index`}
            </h2>
            <div className="w-16 h-1 bg-[var(--color-accent)] mx-auto rounded-full"></div>
          </div>

          <div className="bg-[#121323] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 lg:p-8 border-b border-white/5 bg-white/2 flex justify-between items-center text-xs font-black uppercase tracking-widest text-[var(--color-content-text-secondary)]">
              <span>Selected Scope of Work</span>
              <div className="flex gap-12">
                <span>Pro Quality</span>
                <span>Premium Quality</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {parsed.isRepairType ? (
                // Repair Type variant: display price for this repair type across different flagship devices
                [
                  { name: `Flagship ${brandName} Series (e.g. Pro/Ultra)`, pro: `₹${startingPrice}`, premium: '₹3,999' },
                  { name: `Mid-Range ${brandName} Series (e.g. Plus/Neo)`, pro: '₹1,299', premium: '₹2,499' },
                  { name: `Standard ${brandName} Series (e.g. base model)`, pro: '₹999', premium: '₹1,799' }
                ].map((row, idx) => (
                  <div key={idx} className="p-6 lg:p-8 flex justify-between items-center text-xs lg:text-sm hover:bg-white/1 transition-colors">
                    <span className="font-extrabold uppercase tracking-wide text-white">{row.name}</span>
                    <div className="flex gap-16 font-mono text-zinc-300">
                      <span className="w-16 text-right text-[var(--color-accent)]">{row.pro}</span>
                      <span className="w-16 text-right text-emerald-400 font-extrabold">{row.premium}</span>
                    </div>
                  </div>
                ))
              ) : (
                // Model variant: display different repair categories for this specific model
                [
                  { name: 'Screen Replacement', pro: '₹2,499', premium: '₹4,199' },
                  { name: 'Battery Replacement', pro: '₹999', premium: '₹1,699' },
                  { name: 'Charging Interface Repair', pro: '₹899', premium: '₹1,499' },
                  { name: 'Rear Back Panel Swap', pro: '₹1,199', premium: '₹2,199' },
                  { name: 'Camera Component Refit', pro: '₹1,899', premium: '₹2,999' }
                ].map((row, idx) => (
                  <div key={idx} className="p-6 lg:p-8 flex justify-between items-center text-xs lg:text-sm hover:bg-white/1 transition-colors">
                    <span className="font-extrabold uppercase tracking-wide text-white">{row.name}</span>
                    <div className="flex gap-16 font-mono text-zinc-300">
                      <span className="w-16 text-right text-[var(--color-accent)]">{row.pro}</span>
                      <span className="w-16 text-right text-emerald-400 font-extrabold">{row.premium}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GUARANTEES */}
      <section className="py-20 px-6 lg:px-16 bg-[#111222]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="bg-[#0b0c16] border border-white/5 p-8 rounded-3xl">
            <Clock className="text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0" />
            <h3 className="font-extrabold uppercase text-xs tracking-wider mb-2">Under 60 Minutes</h3>
            <p className="text-xs text-[var(--color-content-text-secondary)] leading-relaxed">
              Diagnostic inspections and swaps are completed on-site with clean-room precision.
            </p>
          </div>

          <div className="bg-[#0b0c16] border border-white/5 p-8 rounded-3xl">
            <ShieldCheck className="text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0" />
            <h3 className="font-extrabold uppercase text-xs tracking-wider mb-2">90-Day Structural Warranty</h3>
            <p className="text-xs text-[var(--color-content-text-secondary)] leading-relaxed">
              Every part installed features comprehensive protection guaranteeing factory-standard performance.
            </p>
          </div>

          <div className="bg-[#0b0c16] border border-white/5 p-8 rounded-3xl">
            <Star className="text-[var(--color-accent)] w-10 h-10 mb-6 mx-auto md:mx-0" />
            <h3 className="font-extrabold uppercase text-xs tracking-wider mb-2">Calibrated Diagnostics</h3>
            <p className="text-xs text-[var(--color-content-text-secondary)] leading-relaxed">
              We apply factory specifications to verify refresh rates, charging flow, and micro-soldering precision.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05060b] border-t border-white/5 py-12 px-6 lg:px-16 text-center text-xs text-[var(--color-content-text-secondary)] font-sans">
        <p>© 2026 GADGET RESTORE INC. TECHNICAL PRECISION. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
