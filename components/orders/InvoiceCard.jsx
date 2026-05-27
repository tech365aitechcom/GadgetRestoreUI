'use client';

import { useState } from 'react';
import { CheckCircle2, Clock3, Download, FileText } from 'lucide-react';
import orderService from '@/services/order.service';

export default function InvoiceCard({ ticketNumber, invoice }) {
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');

  const downloadConfirmation = async () => {
    setDownloading('confirmation');
    setError('');
    try {
      await orderService.downloadConfirmation(ticketNumber);
    } catch (_) {
      setError('Unable to download order confirmation right now.');
    } finally {
      setDownloading('');
    }
  };

  const downloadInvoice = async () => {
    setDownloading('invoice');
    setError('');
    try {
      await orderService.downloadInvoice(ticketNumber);
    } catch (_) {
      setError('Unable to download final invoice right now.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px] mb-5">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <FileText size={18} className="text-[var(--color-accent)]" />
        <h2 style={{ fontSize: 16 }}>Documents</h2>
      </div>
      {error && <p className="text-red-400 text-xs mb-[10px]">{error}</p>}
      <DocumentRow
        title="Order Confirmation"
        description="Booking summary and terms & conditions"
        ready
        buttonText={downloading === 'confirmation' ? 'Downloading...' : 'Download PDF'}
        onDownload={downloadConfirmation}
        disabled={Boolean(downloading)}
      />
      {invoice ? (
        <div className="mt-3">
          <DocumentRow
            title="Final Invoice"
            description={`Invoice No: ${invoice.invoiceNumber}`}
            ready
            buttonText={downloading === 'invoice' ? 'Downloading...' : 'Download PDF'}
            onDownload={downloadInvoice}
            disabled={Boolean(downloading)}
          />
          {invoice.pricing && (
            <div className="grid grid-cols-2 gap-3 mt-3 text-[13px]">
              <InvoiceValue label="Total" value={`Rs ${Number(invoice.pricing.grandTotal || 0).toLocaleString('en-IN')}`} />
              <InvoiceValue label="Payment" value={invoice.paymentMethod || 'COD'} />
              <InvoiceValue label="Advance Paid" value={`Rs ${Number(invoice.pricing.advancePayment || 0).toLocaleString('en-IN')}`} />
              <InvoiceValue label="Balance" value={`Rs ${Number(invoice.pricing.balanceDue || 0).toLocaleString('en-IN')}`} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <DocumentRow
            title="Final Invoice"
            description="Available after your repaired device is delivered"
          />
        </div>
      )}
    </div>
  );
}

function DocumentRow({ title, description, ready = false, buttonText, onDownload, disabled }) {
  return (
    <div className="bg-[var(--theme-card-darker)] border border-[var(--theme-border)] rounded-xl p-4">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-[var(--theme-text-primary)] mb-1">{title}</p>
          <p className="text-xs text-[var(--theme-text-secondary)]">{description}</p>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-semibold ${ready ? 'text-[var(--color-success)]' : 'text-[var(--theme-text-tertiary)]'}`}>
          {ready ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
          {ready ? 'Ready' : 'Pending'}
        </span>
      </div>
      {ready && (
        <button type="button" onClick={onDownload} disabled={disabled} className="btn-secondary !h-[40px] !px-[14px]">
          <Download size={15} /> {buttonText}
        </button>
      )}
    </div>
  );
}

function InvoiceValue({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-[var(--theme-card-darker)] border border-[var(--theme-border)]">
      <p className="text-[11px] text-[var(--theme-text-tertiary)] mb-1">{label}</p>
      <p className="font-semibold text-[var(--theme-text-primary)]">{value}</p>
    </div>
  );
}
