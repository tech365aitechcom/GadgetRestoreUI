'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ClipboardList, Plus } from 'lucide-react';
import orderService from '@/services/order.service';
import { STATUS_LABELS } from '@/lib/constants';

const CLOSED_STATUSES = new Set(['DELIVERED', 'CANCELLED']);

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function badgeColor(status) {
  if (status === 'DELIVERED') return { color: '#22C55E', background: 'rgba(34,197,94,0.12)' };
  if (status === 'CANCELLED') return { color: '#F87171', background: 'rgba(248,113,113,0.12)' };
  if (status === 'CUSTOMER_APPROVAL_PENDING') return { color: '#FBBF24', background: 'rgba(251,191,36,0.12)' };
  return { color: '#93A4FF', background: 'rgba(124,135,255,0.14)' };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const nextOrders = await orderService.getOrders();
        if (isMounted) {
          setOrders(nextOrders);
          setError('');
        }
      } catch (_) {
        if (isMounted) setError('Unable to load your orders right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrders();
    const intervalId = window.setInterval(loadOrders, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const activeCount = orders.filter((order) => !CLOSED_STATUSES.has(order.repairStatus)).length;

  return (
    <main style={{ minHeight: '100svh', background: '#0A0A0A', color: '#fff', padding: '28px 16px 100px' }}>
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 18, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#737373', marginBottom: 8 }}>
              Repairs
            </p>
            <h1 style={{ fontSize: 31, fontWeight: 800 }}>Your Orders</h1>
            {!loading && orders.length > 0 && (
              <p style={{ color: '#A3A3A3', fontSize: 13, marginTop: 8 }}>
                {activeCount} active {activeCount === 1 ? 'repair' : 'repairs'}
              </p>
            )}
          </div>
          <Link href="/select-brand" style={newBookingStyle}>
            <Plus size={16} /> New
          </Link>
        </div>

        {loading ? (
          <div style={stateCardStyle}>Loading your orders...</div>
        ) : error ? (
          <div style={{ ...stateCardStyle, color: '#F87171' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ ...stateCardStyle, padding: '54px 24px' }}>
            <ClipboardList size={42} color="#737373" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No orders yet</h2>
            <p style={{ color: '#A3A3A3', marginBottom: 24 }}>Book your first repair!</p>
            <Link href="/select-brand" style={primaryLinkStyle}>Book Repair</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => {
              const device = [order.brandRef?.name, order.modelRef?.name].filter(Boolean).join(' ') || 'Device Repair';
              const label = STATUS_LABELS[order.repairStatus] || order.repairStatus;

              return (
                <Link key={order.ticketNumber} href={`/orders/${encodeURIComponent(order.ticketNumber)}`} style={orderCardStyle}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ color: '#A3A3A3', fontSize: 12, fontWeight: 600 }}>{order.ticketNumber}</span>
                      <span style={{ ...badgeColor(order.repairStatus), fontSize: 11, fontWeight: 700, padding: '5px 9px', borderRadius: 999 }}>
                        {label}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7 }}>{device}</h2>
                    <p style={{ fontSize: 13, color: '#737373' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <ChevronRight size={18} color="#737373" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const orderCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: 20,
  border: '1px solid #242424',
  borderRadius: 16,
  background: '#141414',
  color: '#fff',
  textDecoration: 'none',
};

const stateCardStyle = {
  display: 'grid',
  placeItems: 'center',
  minHeight: 150,
  padding: 24,
  background: '#141414',
  border: '1px solid #242424',
  borderRadius: 18,
  color: '#A3A3A3',
  textAlign: 'center',
};

const newBookingStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '11px 15px',
  border: '1px solid #303030',
  borderRadius: 10,
  color: '#fff',
  fontWeight: 700,
  fontSize: 13,
  textDecoration: 'none',
};

const primaryLinkStyle = {
  padding: '14px 24px',
  background: '#fff',
  borderRadius: 10,
  color: '#080808',
  textDecoration: 'none',
  fontWeight: 700,
};
