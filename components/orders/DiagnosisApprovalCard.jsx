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
    <div className="bg-[var(--theme-card)] border border-amber-400/30 rounded-[18px] p-[22px] mb-5">
      <p className="text-amber-400 text-[13px] font-bold mb-2">
        Diagnosis complete - revised estimate available
      </p>
      <p className="text-[var(--theme-text-secondary)] text-[13px] leading-normal mb-[18px]">
        Review the diagnosis and approve repair work, or request a call from support.
      </p>
      <div style={{ display: 'flex', gap: 18, marginBottom: 16 }}>
        <Price label="Original estimate" value={cost.original} />
        <Price label="Revised cost" value={cost.final} emphasized={cost.isRevised} />
      </div>
      {approval.diagnosis.revisionReason && (
        <p className="text-[13px] text-[var(--theme-text-primary)] mb-[10px]">
          <strong>Reason: </strong>{approval.diagnosis.revisionReason}
        </p>
      )}
      {approval.diagnosis.findings && (
        <p className="text-[13px] text-[var(--theme-text-secondary)] leading-normal mb-[15px]">
          {approval.diagnosis.findings}
        </p>
      )}
      {approval.diagnosis.pricingItems?.length > 0 && (
        <div className="border border-[var(--theme-border)] rounded-[10px] py-[10px] px-3 mb-4">
          {approval.diagnosis.pricingItems.map((item, index) => (
            <div key={`${item.description}-${index}`} className="py-[8px] text-xs text-[var(--theme-text-primary)] border-b border-[var(--theme-border)] last:border-b-0">
              <div className="flex justify-between gap-3 font-semibold mb-[6px]">
                <span>{item.description || 'Repair item'}</span>
                <span>Rs {formatAmount(item.totalCost)}</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[var(--theme-text-secondary)]">
                <span>Parts: Rs {formatAmount(item.partCost)}</span>
                <span>Labour: Rs {formatAmount(item.labourCost)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {(approval.diagnosis.advancePaymentRequired || approval.diagnosis.advancePaymentRecommended) && (
        <p className="p-3 bg-amber-400/10 text-amber-400 rounded-[10px] text-xs leading-[1.45] mb-4">
          This repair meets the advance review rule. Our support team will contact you if a 50% advance is required before proceeding.
        </p>
      )}
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
      {discussionRequested && (
        <p className="text-[var(--color-success)] text-[13px] mb-3">
          Request received. Our support team will call you to discuss the estimate.
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" onClick={() => act('approve')} disabled={Boolean(busy)} className="h-[45px] border-0 rounded-[10px] px-[15px] inline-flex items-center gap-[6px] bg-[var(--color-success)] text-[#071008] font-bold cursor-pointer disabled:opacity-60">
          <IndianRupee size={15} /> {busy === 'approve' ? 'Approving...' : `Approve Rs ${formatAmount(cost.final)}`}
        </button>
        <button type="button" onClick={() => act('discuss')} disabled={Boolean(busy)} className="btn-secondary !h-[45px] !px-[15px] disabled:opacity-60">
          <PhoneCall size={15} /> {busy === 'discuss' ? 'Requesting...' : 'Call CS to Discuss'}
        </button>
      </div>
    </div>
  );
}

function Price({ label, value, emphasized = false }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--theme-text-tertiary)] mb-[5px]">{label}</p>
      <strong style={{ color: emphasized ? 'var(--color-warning)' : 'var(--theme-text-primary)', fontSize: 20 }}>
        Rs {formatAmount(value)}
      </strong>
    </div>
  );
}
