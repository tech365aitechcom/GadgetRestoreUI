'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import ModelList from '@/components/booking/ModelList';
import catalogueService from '@/services/catalogue.service';
import { useBooking } from '@/context/BookingContext';
import { getBrandLogo } from '@/lib/utils';
import { useBookingGuard } from '@/hooks/useBookingGuard';


export default function SelectModelPage() {
  const router = useRouter();
  const { brand, category, model: selectedModel, setModel } = useBooking();
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard: if no brand selected, redirect back
  const { isReady } = useBookingGuard({ brand: true });

  // If category is present we arrived from the /products page (Book Now flow).
  // The normal select-brand → select-model flow may or may not have a category.
  const fromProductsFlow = !!category;
  const backTarget = fromProductsFlow ? '/products' : '/select-brand';
  const backLabel  = fromProductsFlow ? 'Back to Categories' : 'Back to Brands';

  useEffect(() => {
    if (!brand) return;
    setIsLoading(true);
    setError(null);

    const loadModels = async () => {
      try {
        let brandId = brand._id;
        let all = await catalogueService.getModelsByBrand(brandId);

        // ── Fallback: if no models returned, the brand._id might be stale
        // (e.g. hardcoded in page.js handleBookNowCTA). Re-fetch brands by name.
        if ((!all || all.length === 0) && brand.name) {
          const brands = await catalogueService.getBrands();
          const realBrand = (brands || []).find(
            (b) => b.name?.toLowerCase() === brand.name.toLowerCase()
          );
          if (realBrand && realBrand._id !== brandId) {
            all = await catalogueService.getModelsByBrand(realBrand._id);
          }
        }

        const safeAll = all || [];

        // Filter by category if coming from the products flow
        if (category && category.name && safeAll.length > 0) {
          const catName = category.name.toLowerCase();
          const filtered = safeAll.filter((m) => {
            const mCat = (
              m.categoryId?.name ||
              m.category?.name ||
              m.deviceType ||
              ''
            ).toLowerCase();
            return mCat.includes(catName) || catName.includes(mCat);
          });
          // Only apply filter if it yields results (avoid blank screen on mismatch)
          setModels(filtered.length > 0 ? filtered : safeAll);
        } else {
          setModels(safeAll);
        }
      } catch {
        setError('Failed to load models. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [brand, category]);

  const handleSelectModel = (m) => {
    setModel(m);
    router.push('/select-symptoms');
  };


  if (!isReady) return null;

  const brandName = brand.name;
  const logoUrl = getBrandLogo(brandName, brand.logo);


  return (
    <div className="w-full min-h-[100svh] lg:min-h-0 bg-[var(--color-content-bg)] lg:bg-transparent pb-20 lg:pb-12">
      <div className="px-4 py-5 lg:p-8 flex flex-col gap-4 lg:gap-7">

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Left: Brand logo chip, Back link, Title, Description */}
          <div className="flex-1">
            {/* Back link (Desktop only) */}
            <button
              onClick={() => router.push(backTarget)}
              className="hidden lg:inline-flex items-center gap-1.5 bg-none border-none cursor-pointer text-[var(--color-content-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-3.5 p-0 hover:text-[var(--color-content-text)] transition-colors"
            >
              <ArrowLeft size={14} /> {backLabel}
            </button>

            {/* Selected Brand logo/chip (Mobile only) */}
            <div className="lg:hidden mb-3.5">
              {logoUrl ? (
                <div className="flex items-center gap-2.5">
                  <img
                    src={logoUrl}
                    alt={brandName}
                    className="h-7 object-contain"
                    style={{
                      filter: ['google', 'realme'].includes(brandName.toLowerCase())
                        ? 'none'
                        : 'var(--brand-logo-filter)',
                    }}
                  />
                  <span className="text-xs font-semibold text-[var(--color-content-text-secondary)] uppercase tracking-wider">{brandName}</span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-widest bg-[rgba(108,123,255,0.1)] px-3 py-1 rounded-full">
                  {brandName}
                </span>
              )}
            </div>

            {/* Page Heading */}
            <h1 className="text-[26px] lg:text-[36px] font-black tracking-tight lg:tracking-tighter text-[var(--color-content-text)] uppercase mb-2 lg:mb-2.5">
              {fromProductsFlow && category?.name
                ? `${category.name} Models`
                : 'Select Model'}
            </h1>
            <p className="text-sm text-[var(--color-content-text-secondary)] leading-relaxed max-w-[500px]">
              {fromProductsFlow
                ? `Choose your ${category?.name || brandName} model to get a precise repair quote from our certified technicians.`
                : `Identify your ${brandName} model to receive a precise technical evaluation and repair quote.`}
            </p>
          </div>

        </div>

        {/* Model grid container */}
        {error ? (
          <div className="text-center p-8 lg:p-12 text-[var(--color-danger)] font-semibold">{error}</div>
        ) : (
          /* Desktop gets card container card; mobile displays ModelList directly */
          <div className="lg:bg-[var(--color-content-card)] lg:border lg:border-[var(--color-content-border)] lg:rounded-[20px] lg:p-6">
            <ModelList
              models={models}
              isLoading={isLoading}
              onSelectModel={handleSelectModel}
              selectedModelId={selectedModel?._id}
            />
          </div>
        )}

      </div>
    </div>
  );
}
