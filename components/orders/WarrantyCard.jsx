'use client';

import { useState } from 'react';
import { Download, Share2, ShieldCheck } from 'lucide-react';
import orderService from '@/services/order.service';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function WarrantyCard({ ticketNumber, warranty }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!warranty) return null;

  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      await orderService.downloadWarranty(ticketNumber);
    } catch (_) {
      setError('Unable to download the warranty card right now.');
    } finally {
      setDownloading(false);
    }
  };

  const share = async () => {
    setSharing(true);
    setError('');
    setNotice('');
    try {
      const shared = await orderService.shareWarranty(ticketNumber);
      if (!shared) {
        setError('Sharing PDF is not supported on this browser. Please download it instead.');
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        setError('Unable to share the warranty card right now.');
      }
    } finally {
      setSharing(false);
    }
  };

  const claimContact = [
    warranty.claimContact?.phone,
    warranty.claimContact?.email,
  ].filter(Boolean).join(' / ') || 'customer support';

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px] mb-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <ShieldCheck size={19} className="text-[var(--color-success)]" />
        <h2 style={{ fontSize: 16 }}>Digital Warranty Card</h2>
      </div>
      <p className="text-[13px] text-[var(--theme-text-primary)] mb-3">
        {warranty.device} - Order {warranty.orderReference}
      </p>
      <div className="flex flex-wrap gap-[22px] mb-4">
        <Field label="Starts" value={formatDate(warranty.startDate)} />
        <Field label="Ends" value={formatDate(warranty.expiryDate)} />
        <Field label="Period" value={`${warranty.durationDays} days`} />
      </div>
      {warranty.repairs?.length > 0 && (
        <div className="border border-[var(--theme-border)] rounded-[10px] p-3 mb-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--theme-text-tertiary)] mb-2">Covered Repairs</p>
          {warranty.repairs.map((repair, index) => (
            <div key={`${repair.description}-${index}`} className="py-[7px] text-[13px] text-[var(--theme-text-primary)] border-b border-[var(--theme-border)] last:border-b-0">
              <div className="flex justify-between gap-3">
                <span>{repair.repairType || repair.description}</span>
                <span className="text-[var(--theme-text-secondary)]">{repair.partTier || 'Pro'} tier</span>
              </div>
              <p className="text-[11px] text-[var(--theme-text-secondary)] mt-1">
                {repair.warrantyDays || warranty.durationDays} days: {formatDate(repair.warrantyStartDate || warranty.startDate)} - {formatDate(repair.warrantyEndDate || warranty.expiryDate)}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="text-[13px] text-[var(--theme-text-secondary)] leading-normal mb-4">{warranty.terms}</p>
      <TermList title="Covered" values={warranty.coverage} />
      <TermList title="Not covered" values={warranty.exclusions} />
      <p className="text-xs text-[var(--color-accent)] mt-[14px] mb-4">
        Contact support at {claimContact} with your order ID to initiate a warranty claim.
      </p>
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
      {notice && <p className="text-[var(--color-success)] text-xs mb-3">{notice}</p>}
      <div className="flex flex-wrap gap-[10px]">
        <button type="button" onClick={download} disabled={downloading || sharing} className="btn-secondary !h-[43px] !px-[15px]">
          <Download size={15} /> {downloading ? 'Downloading...' : 'Download Warranty PDF'}
        </button>
        <button type="button" onClick={share} disabled={sharing || downloading} className="btn-secondary !h-[43px] !px-[15px]">
          <Share2 size={15} /> {sharing ? 'Preparing share...' : 'Share Warranty'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[var(--theme-text-tertiary)] text-[11px] mb-1">{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function TermList({ title, values = [] }) {
  if (!values.length) return null;

  return (
    <div className="mb-3">
      <p className="text-[11px] uppercase tracking-wide text-[var(--theme-text-tertiary)] mb-2">{title}</p>
      <ul className="m-0 pl-4 text-xs text-[var(--theme-text-secondary)] leading-relaxed">
        {values.map((value) => <li key={value}>{value}</li>)}
      </ul>
    </div>
  );
}
