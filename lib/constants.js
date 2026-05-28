// API base URL - reads from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7007';

// App info
export const APP_NAME = 'Gadget Restore';
export const SUPPORT_WHATSAPP = 'https://wa.me/919999999999'; // replace with real number
export const SUPPORT_PHONE = 'tel:+919999999999';           // replace with real number
export const SUPPORT_EMAIL = 'mailto:support@gadgetrestore.in';

// Auth
export const TOKEN_COOKIE = 'customer_token';
export const TOKEN_EXPIRY_DAYS = 7;
export const OTP_RESEND_SECONDS = 30;

// Booking
export const SERVICE_MODES = {
  LAB: 'lab',
  DOORSTEP: 'doorstep', // Phase 1: Coming Soon
};

// Order status keys (matches cs-back ticket statuses)
export const ORDER_STATUS = {
  ORDER_PLACED:          'ORDER_PLACED',
  CS_CONFIRMATION_PENDING: 'CS_CONFIRMATION_PENDING',
  CS_CONFIRMED:          'CS_CONFIRMED',
  PICKUP_ASSIGNED:       'PICKUP_ASSIGNED',
  PICKUP_EN_ROUTE:       'PICKUP_EN_ROUTE',
  PICKUP_COMPLETED:      'PICKUP_COMPLETED',
  DEVICE_PICKED_UP:      'DEVICE_PICKED_UP',
  DEVICE_AT_CENTRE:      'DEVICE_AT_CENTRE',
  RECEIVED_AT_CENTRE:    'RECEIVED_AT_CENTRE',
  DIAGNOSIS_PENDING:     'DIAGNOSIS_PENDING',
  DIAGNOSIS_COMPLETED:   'DIAGNOSIS_COMPLETED',
  PENDING_ADVANCE_PAYMENT: 'PENDING_ADVANCE_PAYMENT',
  CUSTOMER_APPROVAL_PENDING: 'CUSTOMER_APPROVAL_PENDING',
  CUSTOMER_APPROVED:     'CUSTOMER_APPROVED',
  REPAIR_IN_PROGRESS:    'REPAIR_IN_PROGRESS',
  REPAIR_COMPLETED:      'REPAIR_COMPLETED',
  FQC_PENDING:           'FQC_PENDING',
  FQC_PASSED:            'FQC_PASSED',
  PAYMENT_PENDING:       'PAYMENT_PENDING',
  PAYMENT_COMPLETED:     'PAYMENT_COMPLETED',
  DELIVERY_ASSIGNED:     'DELIVERY_ASSIGNED',
  OUT_FOR_DELIVERY:      'OUT_FOR_DELIVERY',
  DELIVERED:             'DELIVERED',
  CANCELLED:             'CANCELLED',
};

// Order status display labels
export const STATUS_LABELS = {
  ORDER_PLACED:          'Order Placed',
  CS_CONFIRMATION_PENDING: 'Confirmation Pending',
  CS_CONFIRMED:          'Confirmed',
  PICKUP_ASSIGNED:       'Pickup Scheduled',
  PICKUP_EN_ROUTE:       'Pickup En Route',
  PICKUP_COMPLETED:      'Pickup Completed',
  DEVICE_PICKED_UP:      'Device Picked Up',
  DEVICE_AT_CENTRE:      'At Service Centre',
  RECEIVED_AT_CENTRE:    'At Service Centre',
  DIAGNOSIS_PENDING:     'Under Diagnosis',
  DIAGNOSIS_COMPLETED:   'Diagnosis Complete',
  PENDING_ADVANCE_PAYMENT: 'Advance Payment Required',
  CUSTOMER_APPROVAL_PENDING: 'Awaiting Approval',
  CUSTOMER_APPROVED:     'Approved for Repair',
  REPAIR_IN_PROGRESS:    'Repair Started',
  REPAIR_COMPLETED:      'Repair Done',
  FQC_PENDING:           'Quality Check Pending',
  FQC_PASSED:            'Quality Checked',
  PAYMENT_PENDING:       'Awaiting Payment',
  PAYMENT_COMPLETED:     'Payment Received',
  DELIVERY_ASSIGNED:     'Delivery Scheduled',
  OUT_FOR_DELIVERY:      'Out for Delivery',
  DELIVERED:             'Delivered',
  CANCELLED:             'Cancelled',
};
