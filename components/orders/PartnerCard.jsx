'use client';

import { Bike, Phone } from 'lucide-react';

export default function PartnerCard({ title, partner }) {
  if (!partner) return null;

  const name = partner.user?.name || 'Assigned Partner';
  const phone = partner.phone || partner.user?.phone;
  const vehicle = [partner.vehicleType, partner.vehicleNumber].filter(Boolean).join(' - ');

  return (
    <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 18, padding: 22, marginBottom: 20 }}>
      <p style={{ color: '#737373', fontSize: 12, marginBottom: 12 }}>{title}</p>
      <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{name}</p>
      {vehicle && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#A3A3A3', fontSize: 13, marginBottom: phone ? 12 : 0 }}>
          <Bike size={16} /> {vehicle}
        </p>
      )}
      {phone && (
        <a href={`tel:${phone}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: '#93A4FF', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
          <Phone size={15} /> Call {phone}
        </a>
      )}
    </div>
  );
}
