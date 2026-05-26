'use client';

import { ShieldCheck } from 'lucide-react';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function WarrantyCard({ warranty }) {
  if (!warranty) return null;

  return (
    <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 18, padding: 22, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <ShieldCheck size={19} color="#22C55E" />
        <h2 style={{ fontSize: 16 }}>Digital Warranty Card</h2>
      </div>
      <p style={{ fontSize: 13, color: '#D4D4D4', marginBottom: 12 }}>
        {warranty.device} - Order {warranty.orderReference}
      </p>
      <div style={{ display: 'flex', gap: 22, marginBottom: 16 }}>
        <Field label="Starts" value={formatDate(warranty.startDate)} />
        <Field label="Ends" value={formatDate(warranty.expiryDate)} />
        <Field label="Period" value={`${warranty.durationDays} days`} />
      </div>
      <p style={{ fontSize: 13, color: '#A3A3A3', lineHeight: 1.5 }}>{warranty.terms}</p>
      <p style={{ fontSize: 12, color: '#93A4FF', marginTop: 14 }}>
        Contact customer support with your order ID to initiate a warranty claim.
      </p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p style={{ color: '#737373', fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
    </div>
  );
}
