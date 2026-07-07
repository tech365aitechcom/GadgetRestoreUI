'use client';

import { useState } from 'react';
import { Check, ChevronDown, Circle } from 'lucide-react';
import { ORDER_STEPS, canonicalOrderStatus } from '@/lib/order-status';
import PropTypes from 'prop-types';

function formatMoment(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

OrderTimeline.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  history: PropTypes.array,
  timeline: PropTypes.array,
  partners: PropTypes.object,
};

TimelineStep.propTypes = {
  step: PropTypes.object.isRequired,
  event: PropTypes.object,
  currentKey: PropTypes.string,
  currentStatus: PropTypes.string.isRequired,
  partners: PropTypes.object.isRequired,
  expanded: PropTypes.string.isRequired,
  setExpanded: PropTypes.func.isRequired,
  isLastStep: PropTypes.bool.isRequired,
};

function getPartnerForStep(stepKey, partners) {
  if (['PICKUP_ASSIGNED', 'PICKUP_EN_ROUTE', 'DEVICE_PICKED_UP'].includes(stepKey)) {
    return partners.pickup;
  }
  if (['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(stepKey)) {
    return partners.delivery;
  }
  return null;
}

function hasStepDetails(event, partner) {
  if (partner) return true;
  if (!event) return false;
  return Boolean(event.notes || event.actorType);
}

function getIconStyles(isCurrent, isCompleted) {
  if (isCurrent) {
    return {
      border: '2px solid var(--color-accent)',
      bg: 'rgba(108,123,255,0.18)',
      circleSize: 9,
      circleColor: 'var(--color-accent)',
    };
  }
  if (isCompleted) {
    return {
      border: '2px solid var(--color-success)',
      bg: 'var(--color-success)',
    };
  }
  return {
    border: '2px solid var(--theme-border-strong)',
    bg: 'transparent',
    circleSize: 6,
    circleColor: 'var(--theme-border-strong)',
  };
}

function getTextStyles(isCurrent, isCompleted) {
  if (isCurrent) {
    return { color: 'var(--theme-text-primary)', weight: 700 };
  }
  if (isCompleted) {
    return { color: 'var(--theme-text-primary)', weight: 600 };
  }
  return { color: 'var(--theme-text-disabled)', weight: 600 };
}

function StepIcon({ isCurrent, isCompleted, isLastStep }) {
  const iconStyles = getIconStyles(isCurrent, isCompleted);
  const lineColor = isCompleted ? 'var(--color-success)' : 'var(--theme-divider)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 25,
        height: 25,
        borderRadius: '50%',
        border: iconStyles.border,
        background: iconStyles.bg,
        display: 'grid',
        placeItems: 'center',
      }}>
        {isCompleted ? <Check size={14} color="#08120B" strokeWidth={3} /> : (
          <Circle size={iconStyles.circleSize} fill={iconStyles.circleColor} color={iconStyles.circleColor} />
        )}
      </div>
      {!isLastStep && (
        <div style={{ width: 2, flex: 1, minHeight: 34, background: lineColor }} />
      )}
    </div>
  );
}

StepIcon.propTypes = {
  isCurrent: PropTypes.bool.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isLastStep: PropTypes.bool.isRequired,
};

function StepDetailsToggle({ isExpanded, onClick }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className="border-0 bg-transparent text-[var(--color-accent)] text-xs inline-flex items-center gap-1 mt-2 p-0 cursor-pointer"
    >
      {isExpanded ? 'Hide details' : 'View details'} 
      <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
    </button>
  );
}

StepDetailsToggle.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function StepDetails({ event, partner }) {
  return (
    <div className="mt-2 py-2 px-3 rounded-lg bg-[var(--theme-card-darker)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] leading-relaxed">
      {event.actorType && <p><strong className="text-[var(--theme-text-primary)]">Updated by:</strong> {event.actorType}</p>}
      {event.notes && <p><strong className="text-[var(--theme-text-primary)]">Note:</strong> {event.notes}</p>}
      {partner && <p><strong className="text-[var(--theme-text-primary)]">Partner:</strong> {partner.user?.name || partner.name || 'Assigned Partner'}{partner.eta ? `, ETA ${partner.eta}` : ''}</p>}
    </div>
  );
}

StepDetails.propTypes = {
  event: PropTypes.object.isRequired,
  partner: PropTypes.object,
};

function TimelineStep({
  step,
  event,
  currentKey,
  currentStatus,
  partners,
  expanded,
  setExpanded,
  isLastStep,
}) {
  const isCurrent = step.key === currentKey || (currentStatus === 'CANCELLED' && step.key === 'CANCELLED');
  const isCompleted = Boolean(event) && !isCurrent;
  
  const partner = getPartnerForStep(step.key, partners);
  const showDetailsButton = hasStepDetails(event, partner);
  const isExpanded = expanded === step.key;
  const textStyles = getTextStyles(isCurrent, isCompleted);

  return (
    <div style={{ display: 'flex', gap: 14, minHeight: 68 }}>
      <StepIcon isCurrent={isCurrent} isCompleted={isCompleted} isLastStep={isLastStep} />
      <div style={{ paddingTop: 3, paddingBottom: 18 }}>
        <p style={{ color: textStyles.color, fontWeight: textStyles.weight, marginBottom: event ? 5 : 0 }}>
          {step.label}
          {isCurrent && <span className="ml-[9px] text-[10px] text-[var(--color-accent)] uppercase">Current</span>}
        </p>
        
        {event?.timestamp && (
          <p className="text-xs text-[var(--theme-text-secondary)]">{formatMoment(event.timestamp)}</p>
        )}
        
        {showDetailsButton && (
          <StepDetailsToggle 
            isExpanded={isExpanded} 
            onClick={() => setExpanded(isExpanded ? '' : step.key)} 
          />
        )}
        
        {isExpanded && showDetailsButton && (
          <StepDetails event={event || {}} partner={partner} />
        )}
      </div>
    </div>
  );
}

export default function OrderTimeline({ currentStatus, history = [], timeline = [], partners = {} }) {
  const [expanded, setExpanded] = useState('');
  const currentKey = canonicalOrderStatus(currentStatus);
  const eventsByKey = new Map();

  history.forEach((event) => {
    const key = canonicalOrderStatus(event.status);
    eventsByKey.set(key, event);
  });

  timeline.forEach((event) => {
    const key = canonicalOrderStatus(event.status);
    eventsByKey.set(key, { ...eventsByKey.get(key), ...event });
  });

  const currentIndex = ORDER_STEPS.findIndex((step) => step.key === currentKey);
  const visibleSteps = currentStatus === 'CANCELLED'
    ? [
        ...ORDER_STEPS.filter((step) => eventsByKey.has(step.key)),
        { key: 'CANCELLED', label: 'Cancelled' },
      ]
    : ORDER_STEPS.filter((step, index) => (
        eventsByKey.has(step.key) || step.key === currentKey || index > currentIndex
      ));

  return (
    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[18px] p-[22px]">
      <h2 style={{ fontSize: 16, marginBottom: 24 }}>Tracking Timeline</h2>
      {visibleSteps.map((step, index) => (
        <TimelineStep
          key={step.key}
          step={step}
          event={eventsByKey.get(step.key)}
          currentKey={currentKey}
          currentStatus={currentStatus}
          partners={partners}
          expanded={expanded}
          setExpanded={setExpanded}
          isLastStep={index === visibleSteps.length - 1}
        />
      ))}
    </div>
  );
}
