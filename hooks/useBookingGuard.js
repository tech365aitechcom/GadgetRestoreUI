'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';

/**
 * Custom hook to guard booking flow pages and redirect if prerequisites are missing.
 * Waits for state restoration before checking.
 *
 * @param {Object} requirements - Object specifying which booking steps are required
 * @param {boolean} requirements.brand - Requires brand to be selected
 * @param {boolean} requirements.model - Requires model to be selected
 * @param {boolean} requirements.symptoms - Requires symptoms to be selected
 * @param {boolean} requirements.partTier - Requires part tier to be selected
 */
export function useBookingGuard(requirements = {}) {
  const router = useRouter();
  const { brand, model, symptoms, partTier, isRestored } = useBooking();

  useEffect(() => {
    // Wait for state restoration to complete
    if (!isRestored) return;

    // Check requirements in order and redirect to first missing step
    if (requirements.brand && !brand) {
      router.replace('/select-brand');
      return;
    }

    if (requirements.model && !model) {
      router.replace('/select-model');
      return;
    }

    if (requirements.symptoms && !symptoms?.length) {
      router.replace('/select-symptoms');
      return;
    }

    if (requirements.partTier && !partTier) {
      router.replace('/select-tier');
      return;
    }
  }, [brand, model, symptoms, partTier, isRestored, router, requirements]);

  // Return whether all requirements are met (useful for conditional rendering)
  return {
    isReady: isRestored &&
      (!requirements.brand || !!brand) &&
      (!requirements.model || !!model) &&
      (!requirements.symptoms || !!symptoms?.length) &&
      (!requirements.partTier || !!partTier)
  };
}
