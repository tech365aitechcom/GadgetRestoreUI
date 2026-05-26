'use client';

import { Check, Circle } from 'lucide-react';
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

export default function OrderTimeline({ currentStatus, history = [] }) {
  const currentKey = canonicalOrderStatus(currentStatus);
  const eventsByKey = new Map();

  history.forEach((event) => {
    const key = canonicalOrderStatus(event.status);
    eventsByKey.set(key, event);
  });

  return (
    <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 18, padding: 22 }}>
      <h2 style={{ fontSize: 16, marginBottom: 24 }}>Tracking Timeline</h2>
      {ORDER_STEPS.map((step, index) => {
        const event = eventsByKey.get(step.key);
        const isCurrent = step.key === currentKey;
        const isCompleted = Boolean(event) && !isCurrent;

        return (
          <div key={step.key} style={{ display: 'flex', gap: 14, minHeight: 68 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 25,
                height: 25,
                borderRadius: '50%',
                border: isCurrent ? '2px solid #7C87FF' : isCompleted ? '2px solid #22C55E' : '2px solid #363636',
                background: isCurrent ? 'rgba(124,135,255,0.2)' : isCompleted ? '#22C55E' : 'transparent',
                display: 'grid',
                placeItems: 'center',
              }}>
                {isCompleted ? <Check size={14} color="#08120B" strokeWidth={3} /> : (
                  <Circle size={isCurrent ? 9 : 6} fill={isCurrent ? '#7C87FF' : '#363636'} color={isCurrent ? '#7C87FF' : '#363636'} />
                )}
              </div>
              {index < ORDER_STEPS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 34, background: isCompleted ? '#22C55E' : '#272727' }} />
              )}
            </div>
            <div style={{ paddingTop: 3, paddingBottom: 18 }}>
              <p style={{ color: isCurrent ? '#fff' : isCompleted ? '#E5E5E5' : '#666', fontWeight: isCurrent ? 700 : 600, marginBottom: event ? 5 : 0 }}>
                {step.label}
                {isCurrent && <span style={{ marginLeft: 9, fontSize: 10, color: '#93A4FF', textTransform: 'uppercase' }}>Current</span>}
              </p>
              {event?.timestamp && <p style={{ fontSize: 12, color: '#A3A3A3' }}>{formatMoment(event.timestamp)}</p>}
              {event?.notes && <p style={{ fontSize: 12, color: '#737373', marginTop: 5 }}>{event.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
