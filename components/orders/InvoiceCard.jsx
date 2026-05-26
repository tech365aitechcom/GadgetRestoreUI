'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import orderService from '@/services/order.service';

export default function InvoiceCard({ ticketNumber, invoice }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  if (!invoice) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#A3A3A3', fontSize: 13 }}>Your final invoice is being prepared.</p>
      </div>
    );
  }

  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      await orderService.downloadInvoice(ticketNumber);
    } catch (_) {
      setError('Unable to download invoice right now.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <FileText size={18} color="#93A4FF" />
        <h2 style={{ fontSize: 16 }}>Final Invoice</h2>
      </div>
      <p style={{ color: '#A3A3A3', fontSize: 13, marginBottom: 14 }}>
        Invoice No: <strong style={{ color: '#fff' }}>{invoice.invoiceNumber}</strong>
      </p>
      {error && <p style={{ color: '#F87171', fontSize: 12, marginBottom: 10 }}>{error}</p>}
      <button type="button" onClick={download} disabled={downloading} style={buttonStyle}>
        <Download size={15} /> {downloading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
}

const cardStyle = {
  background: '#141414',
  border: '1px solid #222',
  borderRadius: 18,
  padding: 22,
  marginBottom: 20,
};

const buttonStyle = {
  height: 43,
  padding: '0 15px',
  border: '1px solid #303030',
  borderRadius: 10,
  color: '#fff',
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  fontWeight: 700,
  cursor: 'pointer',
};
