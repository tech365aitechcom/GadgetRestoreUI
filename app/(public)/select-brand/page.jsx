'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import BrandGrid, { TrustBadges } from '@/components/booking/BrandGrid';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';

export default function SelectBrandPage() {
  const router = useRouter();
  const { setBrand, brand: selectedBrand, category } = useBooking();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch brands whenever the category changes (or on first load)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    catalogueService.getBrands(category?._id || null)
      .then((data) => setBrands(data || []))
      .catch(() => setError('Failed to load brands. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [category?._id]);

  const handleSelectBrand = (b) => {
    if (!selectedBrand || selectedBrand._id !== b._id) setBrand(b);
    router.push('/select-model');
  };

  return (
    <div className="w-full min-h-[100svh] lg:min-h-0 bg-[var(--color-content-bg)] lg:bg-transparent pb-20 lg:pb-12">
      <div className="px-4 py-5 lg:p-8 flex flex-col gap-4 lg:gap-7">

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Left: Category filter chip, Title, Description */}
          <div className="flex-1">
            {/* Category filter chip */}
            {category && (
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-[10px] lg:text-[11px] font-bold text-[var(--color-btn-cta-bg)] bg-[var(--color-bg-700)] uppercase tracking-wider lg:tracking-widest px-3 lg:px-3.5 py-1 rounded-full">
                  {category.name}
                </span>
                <button
                  onClick={() => router.push('/select-category')}
                  className="background-none border-none cursor-pointer text-xs text-[var(--color-content-text-secondary)] underline p-0 hover:text-[var(--color-content-text)] transition-colors"
                >
                  Change<span className="hidden lg:inline"> category</span>
                </button>
              </div>
            )}

            {/* Page Heading */}
            <h1 className="text-[26px] lg:text-[36px] font-black tracking-tight lg:tracking-tighter text-[var(--color-content-text)] uppercase mb-2 lg:mb-2.5">
              Select Brand
            </h1>

            {/* Description */}
            <p className="text-sm text-[var(--color-content-text-secondary)] leading-relaxed max-w-[500px]">
              {category
                ? `Showing ${category.name} brands. Use the search bar to filter further or contact our technician team directly.`
                : 'We support over 50+ manufacturers. Use the search bar for specific model compatibility or contact our technician team directly.'}
            </p>
          </div>

        </div>

        {/* Main Grid Content: BrandGrid */}
        {error ? (
          <div className="text-center p-8 lg:p-12 text-[var(--color-danger)] font-semibold">{error}</div>
        ) : (
          <BrandGrid
            brands={brands}
            isLoading={isLoading}
            onSelectBrand={handleSelectBrand}
            selectedBrandId={selectedBrand?._id}
          />
        )}

        {/* Trust badges (Desktop only) */}
        <div className="hidden lg:block mt-8">
          <TrustBadges />
        </div>

      </div>
    </div>
  );
}
