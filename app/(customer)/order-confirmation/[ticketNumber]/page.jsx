'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Package, Plus, ChevronRight } from 'lucide-react';
import bookingService from '@/services/booking.service';
import { useBooking } from '@/context/BookingContext';

function formatDate(date) {
  if (!date) return 'To be confirmed';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { reset } = useBooking();
  const ticketNumber = params.ticketNumber;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    bookingService.getCustomerOrder(ticketNumber)
      .then(setOrder)
      .catch(() => setError('Unable to load this order. Please open it again from your orders.'));
  }, [ticketNumber]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      setError('Copy failed. Please note the order ID shown below.');
    }
  };

  const handleBookAnother = () => {
    reset();
    router.push('/select-brand');
  };

  if (error && !order) {
    return (
      <main style={{ minHeight: '70svh', display: 'grid', placeItems: 'center', padding: 24, background: '#0A0A0A', color: '#fff' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p style={{ color: '#F87171', marginBottom: 20 }}>{error}</p>
          <button type="button" onClick={() => router.push('/orders')} style={secondaryButtonStyle}>
            Go to Orders
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={{ minHeight: '70svh', display: 'grid', placeItems: 'center', background: '#0A0A0A', color: '#fff' }}>
        Loading your order confirmation...
      </main>
    );
  }

  const device = [order.brandRef?.name, order.modelRef?.name].filter(Boolean).join(' ');
  const repairs = (order.repairTypes || []).map((repair) => repair.name).join(', ');
  const address = order.address?.addressLine1
    ? [order.address.addressLine1, order.address.city, order.address.pincode].filter(Boolean).join(', ')
    : 'Our team will confirm the collection address on call.';

  return (
    <main style={{ background: '#0A0A0A', minHeight: '100svh', color: '#fff', padding: '32px 16px 100px' }}>
      <section style={{ maxWidth: 680, margin: '0 auto', background: '#141414', border: '1px solid #222', borderRadius: 24, padding: '36px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <CheckCircle2 size={68} color="#22C55E" strokeWidth={1.7} style={{ margin: '0 auto 18px' }} />
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>Order Confirmed</h1>
          <p style={{ color: '#A3A3A3', lineHeight: 1.55 }}>
            Our customer support team will call you shortly to confirm your order.
          </p>
        </div>

        <div style={{ background: '#0A0A0A', border: '1px solid #272727', borderRadius: 16, padding: 20, marginBottom: 22 }}>
          <p style={{ color: '#737373', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Order ID
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 23, letterSpacing: '0.02em', wordBreak: 'break-all' }}>{ticketNumber}</strong>
            <button type="button" onClick={handleCopy} aria-label="Copy order ID" style={iconButtonStyle}>
              <Copy size={17} />
            </button>
          </div>
          {copied && <p style={{ color: '#22C55E', fontSize: 12, marginTop: 9 }}>Order ID copied.</p>}
        </div>

        <div style={{ border: '1px solid #222', borderRadius: 16, padding: 20, marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={17} color="#7C87FF" /> Summary
          </h2>
          <SummaryRow label="Device" value={device || 'Device selected'} />
          <SummaryRow label="Repair" value={repairs || 'Inspection and repair'} />
          <SummaryRow label="Pickup date" value={formatDate(order.slotDate)} />
          <SummaryRow label="Pickup time" value={order.slotTime || 'To be confirmed'} />
          <SummaryRow label="Address" value={address} isLast />
        </div>

        {error && <p style={{ color: '#F87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <button type="button" onClick={() => router.push(`/orders/${encodeURIComponent(ticketNumber)}`)} style={primaryButtonStyle}>
          Track Order <ChevronRight size={18} />
        </button>
        <button type="button" onClick={handleBookAnother} style={{ ...secondaryButtonStyle, width: '100%', marginTop: 12 }}>
          <Plus size={17} /> Book Another Repair
        </button>
      </section>
    </main>
  );
}

function SummaryRow({ label, value, isLast = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 12, padding: '11px 0', borderBottom: isLast ? 'none' : '1px solid #242424', fontSize: 13, lineHeight: 1.45 }}>
      <span style={{ color: '#737373' }}>{label}</span>
      <span style={{ color: '#E5E5E5', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const primaryButtonStyle = {
  width: '100%',
  height: 54,
  border: 'none',
  borderRadius: 12,
  background: '#fff',
  color: '#080808',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const secondaryButtonStyle = {
  height: 54,
  padding: '0 22px',
  border: '1px solid #303030',
  borderRadius: 12,
  background: 'transparent',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const iconButtonStyle = {
  height: 42,
  width: 42,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  border: '1px solid #303030',
  borderRadius: 10,
  background: '#161616',
  color: '#fff',
  cursor: 'pointer',
};
