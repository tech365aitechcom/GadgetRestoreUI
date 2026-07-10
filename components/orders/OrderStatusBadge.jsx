'use client';

import Badge from '@/components/ui/Badge';
import { STATUS_LABELS } from '@/lib/constants';
import PropTypes from 'prop-types';

function variantFor(status) {
  if (status === 'DELIVERED') return 'success';
  if (status === 'CANCELLED') return 'danger';
  if (['CUSTOMER_APPROVAL_PENDING', 'PENDING_ADVANCE_PAYMENT', 'PAYMENT_PENDING'].includes(status)) {
    return 'warning';
  }
  return 'accent';
}

OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default function OrderStatusBadge({ status, size = 'md' }) {
  return (
    <Badge variant={variantFor(status)} size={size}>
      {STATUS_LABELS[status] || status?.replaceAll('_', ' ') || 'Pending'}
    </Badge>
  );
}
