'use client';

import { useState } from 'react';
import { IndianRupee, PhoneCall } from 'lucide-react';
import orderService from '@/services/order.service';

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-IN');
}

export default function DiagnosisApprovalCard({ ticketNumber, approval, onUpdated }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [discussionRequested, setDiscussionRequested] = useState(false);

  if (!approval?.diagnosis || !approval.canApprove) return null;

  const cost = approval.diagnosis.cost;

  const act = async (type) => {
    setBusy(type);
    setError('');
    try {
      if (type === 'approve') {
        await orderService.approveDiagnosis(ticketNumber);
      } else {
        await orderService.discussDiagnosis(ticketNumber);
        setDiscussionRequested(true);
      }
      onUpdated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your response right now.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div style={{ background: '#141414', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 18, padding: 22, marginBottom: 20 }}>
      <p style={{ color: '#FBBF24', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        Diagnosis complete - revised estimate available
      </p>
      <p style={{ color: '#A3A3A3', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
        Review the diagnosis and approve repair work, or request a call from support.
      </p>
      <div style={{ display: 'flex', gap: 18, marginBottom: 16 }}>
        <Price label="Original estimate" value={cost.original} />
        <Price label="Revised cost" value={cost.final} emphasized={cost.isRevised} />
      </div>
      {approval.diagnosis.revisionReason && (
        <p style={{ fontSize: 13, color: '#D4D4D4', marginBottom: 10 }}>
          <strong>Reason: </strong>{approval.diagnosis.revisionReason}
        </p>
      )}
      {approval.diagnosis.findings && (
        <p style={{ fontSize: 13, color: '#A3A3A3', lineHeight: 1.5, marginBottom: 15 }}>
          {approval.diagnosis.findings}
        </p>
      )}
      {approval.diagnosis.advancePaymentRequired && (
        <p style={{ padding: 12, background: 'rgba(251,191,36,0.08)', color: '#FBBF24', borderRadius: 10, fontSize: 12, lineHeight: 1.45, marginBottom: 16 }}>
          A 50% advance may be required. Our support team will contact you before proceeding.
        </p>
      )}
      {error && <p style={{ color: '#F87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}
      {discussionRequested && (
        <p style={{ color: '#22C55E', fontSize: 13, marginBottom: 12 }}>
          Request received. Our support team will call you to discuss the estimate.
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" onClick={() => act('approve')} disabled={Boolean(busy)} style={approveStyle}>
          <IndianRupee size={15} /> {busy === 'approve' ? 'Approving...' : `Approve Rs ${formatAmount(cost.final)}`}
        </button>
        <button type="button" onClick={() => act('discuss')} disabled={Boolean(busy)} style={discussStyle}>
          <PhoneCall size={15} /> {busy === 'discuss' ? 'Requesting...' : 'Call CS to Discuss'}
        </button>
      </div>
    </div>
  );
}

function Price({ label, value, emphasized = false }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#737373', marginBottom: 5 }}>{label}</p>
      <strong style={{ color: emphasized ? '#FBBF24' : '#fff', fontSize: 20 }}>
        Rs {formatAmount(value)}
      </strong>
    </div>
  );
}

const approveStyle = {
  height: 45,
  border: 0,
  borderRadius: 10,
  padding: '0 15px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#22C55E',
  color: '#071008',
  fontWeight: 700,
  cursor: 'pointer',
};

const discussStyle = {
  ...approveStyle,
  background: 'transparent',
  color: '#fff',
  border: '1px solid #303030',
};
