'use client';

import { usePathname } from 'next/navigation';

/**
 * Step progress indicator for the booking flow
 * Shows the current step with dots
 * Only shows for booking flow pages, hidden on home page
 */
export default function StepIndicator({ currentStep, totalSteps = 5 }) {
  const pathname = usePathname();

  // Auto-detect current step based on pathname if not provided
  const stepMapping = {
    '/select-category': 1,
    '/select-model': 2,
    '/select-symptoms': 3,
    '/select-tier': 4,
    '/select-mode': 5,
    '/pricing': 5,
  };

  // Don't show step indicator on home page or pages not in the booking flow
  const isHomePage = pathname === '/home' || pathname === '/';
  const isBookingFlow = stepMapping[pathname] !== undefined;

  if (isHomePage || !isBookingFlow) {
    return null;
  }

  const step = currentStep ?? stepMapping[pathname] ?? 1;

  return (
    <div className="step-progress">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        let className = 'step-dot';

        if (stepNumber < step) {
          className += ' done';
        } else if (stepNumber === step) {
          className += ' active';
        }

        return <div key={stepNumber} className={className} />;
      })}
    </div>
  );
}
