'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Download, Package, Plus, ChevronRight } from 'lucide-react';
import bookingService from '@/services/booking.service';
import orderService from '@/services/order.service';
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
  const [shareNotice, setShareNotice] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    bookingService.getCustomerOrder(ticketNumber)
      .then(setOrder)
      .catch(() => setError('Unable to load this order. Please open it again from your orders.'));
  }, [ticketNumber]);

  const handleShareOrderId = async () => {
    setError('');
    setShareNotice('');

    try {
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ticketNumber);
        setShareNotice('Order ID copied.');
        window.setTimeout(() => setShareNotice(''), 1800);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Gadget Restore Order ID',
          text: `My Gadget Restore order ID is ${ticketNumber}.`,
        });
        setShareNotice('Order ID shared.');
        window.setTimeout(() => setShareNotice(''), 1800);
        return;
      }

      const textArea = document.createElement('textarea');
      textArea.value = ticketNumber;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (!copied) throw new Error('Copy is not available');

      setShareNotice('Order ID copied.');
      window.setTimeout(() => setShareNotice(''), 1800);
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        setError('Unable to share automatically. Please press and hold the Order ID to copy it.');
      }
    }
  };

  const handleBookAnother = () => {
    reset();
    router.push('/select-brand');
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      await orderService.downloadConfirmation(ticketNumber);
    } catch (_) {
      setError('Unable to download your confirmation document right now.');
    } finally {
      setDownloading(false);
    }
  };

  if (error && !order) {
    return (
      <main className="min-h-[70svh] grid place-items-center p-6 bg-[var(--theme-bg)] text-[var(--theme-text-primary)]">
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p className="text-red-400 mb-5">{error}</p>
          <button type="button" onClick={() => router.push('/orders')} className="btn-secondary">
            Go to Orders
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-[70svh] grid place-items-center bg-[var(--theme-bg)] text-[var(--theme-text-secondary)]">
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
    <main className="bg-[var(--theme-bg)] min-h-[100svh] text-[var(--theme-text-primary)] px-4 pt-8 pb-[100px]">
      <section className="max-w-[680px] mx-auto bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-3xl py-9 px-6 shadow-[var(--theme-shadow-sm)]">
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <CheckCircle2 className="order-success-mark mx-auto mb-[18px] text-[var(--color-success)]" size={68} strokeWidth={1.7} />
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>Order Confirmed</h1>
          <p className="text-[var(--theme-text-secondary)] leading-relaxed">
            Our customer support team will call you shortly to confirm your order.
          </p>
        </div>

        <div className="bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-2xl p-5 mb-[22px]">
          <p className="text-[var(--theme-text-tertiary)] text-[11px] font-bold tracking-[0.12em] uppercase mb-2">
            Order ID
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 23, letterSpacing: '0.02em', wordBreak: 'break-all' }}>{ticketNumber}</strong>
            <button type="button" onClick={handleShareOrderId} aria-label="Share or copy order ID" className="h-[42px] w-[42px] shrink-0 grid place-items-center border border-[var(--theme-border-strong)] rounded-[10px] bg-[var(--theme-btn-secondary-bg)] text-[var(--theme-text-primary)] cursor-pointer">
                <Copy size={17} />
            </button>
          </div>
          {shareNotice && <p className="text-[var(--color-success)] text-xs mt-[9px]">{shareNotice}</p>}
        </div>

        <div className="border border-[var(--theme-border)] rounded-2xl p-5 mb-7">
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={17} className="text-[var(--color-accent)]" /> Summary
          </h2>
          <SummaryRow label="Device" value={device || 'Device selected'} />
          <SummaryRow label="Repair" value={repairs || 'Inspection and repair'} />
          <SummaryRow label="Pickup date" value={formatDate(order.slotDate)} />
          <SummaryRow label="Pickup time" value={order.slotTime || 'To be confirmed'} />
          <SummaryRow label="Address" value={address} isLast />
        </div>

        {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}
        <button type="button" onClick={() => router.push(`/orders/${encodeURIComponent(ticketNumber)}`)} className="btn-primary w-full !h-[54px]">
          Track Order <ChevronRight size={18} />
        </button>
        <button type="button" onClick={handleDownload} disabled={downloading} className="btn-secondary w-full !h-[54px] mt-3">
          <Download size={17} /> {downloading ? 'Downloading...' : 'Download Confirmation PDF'}
        </button>
        <button type="button" onClick={handleBookAnother} className="btn-secondary w-full !h-[54px] mt-3">
          <Plus size={17} /> Book Another Repair
        </button>
      </section>
    </main>
  );
}

function SummaryRow({ label, value, isLast = false }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 py-[11px] text-[13px] leading-[1.45]" style={{ borderBottom: isLast ? 'none' : '1px solid var(--theme-divider)' }}>
      <span className="text-[var(--theme-text-tertiary)]">{label}</span>
      <span className="text-[var(--theme-text-primary)] font-medium">{value}</span>
    </div>
  );
}
