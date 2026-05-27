'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import bookingService from '@/services/booking.service';
import orderService from '@/services/order.service';
import OrderTimeline from '@/components/orders/OrderTimeline';
import PartnerCard from '@/components/orders/PartnerCard';
import DiagnosisApprovalCard from '@/components/orders/DiagnosisApprovalCard';
import InvoiceCard from '@/components/orders/InvoiceCard';
import WarrantyCard from '@/components/orders/WarrantyCard';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';

function formatDate(value) {
  if (!value) return 'To be confirmed';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrderDetailPage() {
  const { ticketNumber } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [approval, setApproval] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [error, setError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        const nextOrder = await bookingService.getCustomerOrder(ticketNumber);
        if (isMounted) {
          setOrder(nextOrder);
          setError('');
          setLastUpdated(new Date());
        }

        if (nextOrder.repairStatus === 'CUSTOMER_APPROVAL_PENDING') {
          const nextApproval = await orderService.getApproval(ticketNumber);
          if (isMounted) setApproval(nextApproval);
        } else if (isMounted) {
          setApproval(null);
        }

        if (nextOrder.repairStatus === 'DELIVERED') {
          const [nextInvoice, nextWarranty] = await Promise.all([
            orderService.getInvoice(ticketNumber),
            orderService.getWarranty(ticketNumber),
          ]);
          if (isMounted) {
            setInvoice(nextInvoice);
            setWarranty(nextWarranty);
          }
        } else if (isMounted) {
          setInvoice(null);
          setWarranty(null);
        }
      } catch (_) {
        if (isMounted) setError('Unable to load this order.');
      }
    };

    loadOrder();
    const intervalId = window.setInterval(loadOrder, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [reloadVersion, ticketNumber]);

  const device = order && [order.brandRef?.name, order.modelRef?.name].filter(Boolean).join(' ');
  const repairs = order?.repairTypes?.map((repair) => repair.name).join(', ');
  const address = order?.address?.addressLine1
    ? [order.address.addressLine1, order.address.city, order.address.pincode].filter(Boolean).join(', ')
    : 'To be confirmed';

  return (
    <main className="min-h-[100svh] px-4 pt-6 pb-[100px] text-[var(--theme-text-primary)] bg-[var(--theme-bg)]">
      <section style={{ maxWidth: 720, margin: '0 auto' }}>
        <button type="button" onClick={() => router.back()} className="border-0 bg-transparent text-[var(--theme-text-secondary)] flex items-center gap-[7px] cursor-pointer mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        {error ? <p className="text-red-400">{error}</p> : !order ? (
          <p className="text-[var(--theme-text-secondary)]">Loading order...</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-[22px]">
              <div>
                <p className="text-[var(--theme-text-tertiary)] uppercase tracking-[0.12em] text-[11px] mb-2">Order ID</p>
                <h1 className="text-[28px] font-extrabold">{order.ticketNumber}</h1>
              </div>
              <button type="button" onClick={() => setReloadVersion((current) => current + 1)} className="btn-secondary !h-[40px] !px-3" aria-label="Refresh status">
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px] mb-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[var(--theme-text-tertiary)] text-xs mb-[9px]">Current Status</p>
                <OrderStatusBadge status={order.repairStatus} />
              </div>
              {lastUpdated && <p className="text-[11px] text-[var(--theme-text-tertiary)]">Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p>}
            </div>
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px] mb-5">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2"><Package size={17} className="text-[var(--color-accent)]" /> Repair Summary</h2>
              <SummaryRow label="Device" value={device || 'Device Repair'} />
              <SummaryRow label="Repair" value={repairs || 'Inspection and repair'} />
              <SummaryRow label="Pickup" value={`${formatDate(order.slotDate)}${order.slotTime ? `, ${order.slotTime}` : ''}`} />
              <SummaryRow label="Address" value={address} />
              <SummaryRow label="Estimate" value={order.finalCost != null ? `Rs ${Number(order.finalCost).toLocaleString('en-IN')}` : 'To be confirmed'} last />
            </div>
            {order.repairStatus === 'CANCELLED' && (
              <div className="bg-red-500/10 text-red-400 border border-red-400/25 rounded-2xl p-[18px] mb-5">
                This order has been cancelled.
                {order.cancellationReason && <p style={{ marginTop: 8, fontSize: 13 }}>Reason: {order.cancellationReason}</p>}
              </div>
            )}
            {order.repairStatus === 'PENDING_ADVANCE_PAYMENT' && (
              <div className="bg-amber-400/10 text-amber-400 border border-amber-400/25 rounded-2xl p-[18px] mb-5">
                Diagnosis is complete. Our support team will contact you regarding the required advance payment.
              </div>
            )}
            <DiagnosisApprovalCard
              ticketNumber={ticketNumber}
              approval={approval}
              onUpdated={() => setReloadVersion((current) => current + 1)}
            />
            {['PICKUP_ASSIGNED', 'PICKUP_EN_ROUTE'].includes(order.repairStatus) && (
              <PartnerCard title="Pickup Partner" partner={order.pickupPartner ? { ...order.pickupPartner, eta: order.pickupEta } : null} />
            )}
            {['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY'].includes(order.repairStatus) && (
              <PartnerCard title="Delivery Partner" partner={order.deliveryPartner ? { ...order.deliveryPartner, eta: order.deliveryEta } : null} />
            )}
            <InvoiceCard ticketNumber={ticketNumber} invoice={invoice} />
            {order.repairStatus === 'DELIVERED' && <WarrantyCard ticketNumber={ticketNumber} warranty={warranty} />}
            <OrderTimeline
              currentStatus={order.repairStatus}
              history={order.repairStatusHistory}
              timeline={order.timeline}
              partners={{
                pickup: order.pickupPartner ? { ...order.pickupPartner, eta: order.pickupEta } : null,
                delivery: order.deliveryPartner ? { ...order.deliveryPartner, eta: order.deliveryEta } : null,
              }}
            />
          </>
        )}
      </section>
    </main>
  );
}

function SummaryRow({ label, value, last = false }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 py-[10px] text-[13px]" style={{ borderBottom: last ? 'none' : '1px solid var(--theme-divider)' }}>
      <span className="text-[var(--theme-text-tertiary)]">{label}</span>
      <span className="text-[var(--theme-text-primary)] font-medium">{value}</span>
    </div>
  );
}
