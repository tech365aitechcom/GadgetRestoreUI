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
  CS_CONFIRMED:          'CS_CONFIRMED',
  PICKUP_ASSIGNED:       'PICKUP_ASSIGNED',
  PICKUP_IN_PROGRESS:    'PICKUP_IN_PROGRESS',
  DEVICE_PICKED_UP:      'DEVICE_PICKED_UP',
  RECEIVED_AT_CENTRE:    'RECEIVED_AT_CENTRE',
  DIAGNOSIS_IN_PROGRESS: 'DIAGNOSIS_IN_PROGRESS',
  DIAGNOSIS_COMPLETE:    'DIAGNOSIS_COMPLETE',
  CUSTOMER_APPROVED:     'CUSTOMER_APPROVED',
  REPAIR_IN_PROGRESS:    'REPAIR_IN_PROGRESS',
  REPAIR_COMPLETED:      'REPAIR_COMPLETED',
  QC_PASSED:             'QC_PASSED',
  PAYMENT_PENDING:       'PAYMENT_PENDING',
  PAYMENT_COMPLETED:     'PAYMENT_COMPLETED',
  DELIVERY_ASSIGNED:     'DELIVERY_ASSIGNED',
  DELIVERY_IN_PROGRESS:  'DELIVERY_IN_PROGRESS',
  DELIVERED:             'DELIVERED',
  CANCELLED:             'CANCELLED',
};

// Order status display labels
export const STATUS_LABELS = {
  ORDER_PLACED:          'Order Placed',
  CS_CONFIRMED:          'Confirmed',
  PICKUP_ASSIGNED:       'Pickup Scheduled',
  PICKUP_IN_PROGRESS:    'Pickup En Route',
  DEVICE_PICKED_UP:      'Device Picked Up',
  RECEIVED_AT_CENTRE:    'At Service Centre',
  DIAGNOSIS_IN_PROGRESS: 'Under Diagnosis',
  DIAGNOSIS_COMPLETE:    'Diagnosis Complete',
  CUSTOMER_APPROVED:     'Approved for Repair',
  REPAIR_IN_PROGRESS:    'Repair Started',
  REPAIR_COMPLETED:      'Repair Done',
  QC_PASSED:             'Quality Checked',
  PAYMENT_PENDING:       'Awaiting Payment',
  PAYMENT_COMPLETED:     'Payment Received',
  DELIVERY_ASSIGNED:     'Delivery Scheduled',
  DELIVERY_IN_PROGRESS:  'Out for Delivery',
  DELIVERED:             'Delivered',
  CANCELLED:             'Cancelled',
};
