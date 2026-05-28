'use client';

import { useState } from 'react';
import { Check, ChevronDown, Circle } from 'lucide-react';
import { ORDER_STEPS, canonicalOrderStatus } from '@/lib/order-status';

function formatMoment(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function OrderTimeline({ currentStatus, history = [], timeline = [], partners = {} }) {
  const [expanded, setExpanded] = useState('');
  const currentKey = canonicalOrderStatus(currentStatus);
  const eventsByKey = new Map();

  history.forEach((event) => {
    const key = canonicalOrderStatus(event.status);
    eventsByKey.set(key, event);
  });

  timeline.forEach((event) => {
    const key = canonicalOrderStatus(event.status);
    eventsByKey.set(key, { ...eventsByKey.get(key), ...event });
  });

  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === currentKey);
  const visibleSteps = currentStatus === 'CANCELLED'
    ? [
        ...ORDER_STEPS.filter((step) => eventsByKey.has(step.key)),
        { key: 'CANCELLED', label: 'Cancelled' },
      ]
    : ORDER_STEPS.filter((step, index) => (
        eventsByKey.has(step.key) || step.key === currentKey || index > currentIndex
      ));

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px]">
      <h2 style={{ fontSize: 16, marginBottom: 24 }}>Tracking Timeline</h2>
      {visibleSteps.map((step, index) => {
        const event = eventsByKey.get(step.key);
        const isCurrent = step.key === currentKey || (currentStatus === 'CANCELLED' && step.key === 'CANCELLED');
        const isCompleted = Boolean(event) && !isCurrent;
        const partner = ['PICKUP_ASSIGNED', 'PICKUP_EN_ROUTE', 'DEVICE_PICKED_UP'].includes(step.key)
          ? partners.pickup
          : ['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(step.key)
            ? partners.delivery
            : null;
        const hasDetails = Boolean(event?.notes || event?.actorType || partner);
        const isExpanded = expanded === step.key;

        return (
          <div key={step.key} style={{ display: 'flex', gap: 14, minHeight: 68 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 25,
                height: 25,
                borderRadius: '50%',
                border: isCurrent ? '2px solid var(--color-accent)' : isCompleted ? '2px solid var(--color-success)' : '2px solid var(--theme-border-strong)',
                background: isCurrent ? 'rgba(108,123,255,0.18)' : isCompleted ? 'var(--color-success)' : 'transparent',
                display: 'grid',
                placeItems: 'center',
              }}>
                {isCompleted ? <Check size={14} color="#08120B" strokeWidth={3} /> : (
                  <Circle size={isCurrent ? 9 : 6} fill={isCurrent ? 'var(--color-accent)' : 'var(--theme-border-strong)'} color={isCurrent ? 'var(--color-accent)' : 'var(--theme-border-strong)'} />
                )}
              </div>
              {index < visibleSteps.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 34, background: isCompleted ? 'var(--color-success)' : 'var(--theme-divider)' }} />
              )}
            </div>
            <div style={{ paddingTop: 3, paddingBottom: 18 }}>
              <p style={{ color: isCurrent || isCompleted ? 'var(--theme-text-primary)' : 'var(--theme-text-disabled)', fontWeight: isCurrent ? 700 : 600, marginBottom: event ? 5 : 0 }}>
                {step.label}
                {isCurrent && <span className="ml-[9px] text-[10px] text-[var(--color-accent)] uppercase">Current</span>}
              </p>
              {event?.timestamp && <p className="text-xs text-[var(--theme-text-secondary)]">{formatMoment(event.timestamp)}</p>}
              {hasDetails && (
                <button type="button" onClick={() => setExpanded(isExpanded ? '' : step.key)} className="border-0 bg-transparent text-[var(--color-accent)] text-xs inline-flex items-center gap-1 mt-2 p-0 cursor-pointer">
                  {isExpanded ? 'Hide details' : 'View details'} <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                </button>
              )}
              {isExpanded && (
                <div className="mt-2 py-2 px-3 rounded-lg bg-[var(--theme-card-darker)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] leading-relaxed">
                  {event.actorType && <p><strong className="text-[var(--theme-text-primary)]">Updated by:</strong> {event.actorType}</p>}
                  {event.notes && <p><strong className="text-[var(--theme-text-primary)]">Note:</strong> {event.notes}</p>}
                  {partner && <p><strong className="text-[var(--theme-text-primary)]">Partner:</strong> {partner.user?.name || partner.name || 'Assigned Partner'}{partner.eta ? `, ETA ${partner.eta}` : ''}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
