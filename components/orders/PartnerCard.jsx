'use client';

import { Bike, Phone } from 'lucide-react';

export default function PartnerCard({ title, partner }) {
  if (!partner) return null;

  const name = partner.user?.name || partner.name || 'Assigned Partner';
  const phone = partner.phone || partner.user?.phone;
  const vehicle = [partner.vehicleType, partner.vehicleNumber].filter(Boolean).join(' - ');

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px] mb-5">
      <p className="text-[var(--theme-text-tertiary)] text-xs mb-3">{title}</p>
      <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{name}</p>
      {vehicle && (
        <p className="flex items-center gap-2 text-[var(--theme-text-secondary)] text-[13px]" style={{ marginBottom: phone ? 12 : 0 }}>
          <Bike size={16} /> {vehicle}
        </p>
      )}
      {partner.eta && (
        <p className="text-[var(--theme-text-secondary)] text-[13px]" style={{ marginBottom: phone ? 12 : 0 }}>
          ETA: {partner.eta}
        </p>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="inline-flex gap-2 items-center text-[var(--color-accent)] text-sm no-underline font-semibold">
          <Phone size={15} /> Call {phone}
        </a>
      )}
    </div>
  );
}
