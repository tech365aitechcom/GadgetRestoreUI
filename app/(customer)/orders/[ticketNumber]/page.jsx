'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import bookingService from '@/services/booking.service';
import orderService from '@/services/order.service';
import { STATUS_LABELS } from '@/lib/constants';
import OrderTimeline from '@/components/orders/OrderTimeline';
import PartnerCard from '@/components/orders/PartnerCard';
import DiagnosisApprovalCard from '@/components/orders/DiagnosisApprovalCard';
import InvoiceCard from '@/components/orders/InvoiceCard';
import WarrantyCard from '@/components/orders/WarrantyCard';

export default function OrderDetailPage() {
  const { ticketNumber } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [approval, setApproval] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [error, setError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        const nextOrder = await bookingService.getCustomerOrder(ticketNumber);
        if (isMounted) {
          setOrder(nextOrder);
          setError('');
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

  return (
    <main style={{ minHeight: '100svh', padding: '24px 16px 100px', color: '#fff', background: '#0A0A0A' }}>
      <section style={{ maxWidth: 720, margin: '0 auto' }}>
        <button type="button" onClick={() => router.back()} style={{ border: 0, background: 'transparent', color: '#A3A3A3', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>
        {error ? <p style={{ color: '#F87171' }}>{error}</p> : !order ? (
          <p>Loading order...</p>
        ) : (
          <>
            <p style={{ color: '#737373', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11, marginBottom: 8 }}>Order ID</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 22 }}>{order.ticketNumber}</h1>
            <div style={{ background: '#141414', border: '1px solid #222', borderRadius: 18, padding: 22, marginBottom: 20 }}>
              <p style={{ color: '#737373', fontSize: 12, marginBottom: 7 }}>Current Status</p>
              <strong style={{ color: '#22C55E', fontSize: 18 }}>
                {STATUS_LABELS[order.repairStatus] || order.repairStatus}
              </strong>
            </div>
            {order.repairStatus === 'CANCELLED' && (
              <div style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 16, padding: 18, marginBottom: 20 }}>
                This order has been cancelled.
              </div>
            )}
            {order.repairStatus === 'PENDING_ADVANCE_PAYMENT' && (
              <div style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 16, padding: 18, marginBottom: 20 }}>
                Diagnosis is complete. Our support team will contact you regarding the required advance payment.
              </div>
            )}
            <DiagnosisApprovalCard
              ticketNumber={ticketNumber}
              approval={approval}
              onUpdated={() => setReloadVersion((current) => current + 1)}
            />
            {['PICKUP_ASSIGNED', 'PICKUP_EN_ROUTE'].includes(order.repairStatus) && (
              <PartnerCard title="Pickup Partner" partner={order.pickupPartner} />
            )}
            {['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY'].includes(order.repairStatus) && (
              <PartnerCard title="Delivery Partner" partner={order.deliveryPartner} />
            )}
            {order.repairStatus === 'DELIVERED' && <InvoiceCard ticketNumber={ticketNumber} invoice={invoice} />}
            {order.repairStatus === 'DELIVERED' && <WarrantyCard warranty={warranty} />}
            <OrderTimeline currentStatus={order.repairStatus} history={order.repairStatusHistory} />
          </>
        )}
      </section>
    </main>
  );
}
