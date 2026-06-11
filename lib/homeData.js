import { BookOpen, FileText, History } from 'lucide-react'

/**
 * Default repair manuals data for home page
 * These are placeholders until actual device-specific manuals are loaded
 */
export const DEFAULT_MANUALS = [
  {
    label: 'iPhone Display Repair SOP',
    sub: 'Standard operating manual',
    Icon: BookOpen,
  },
  {
    label: 'Li-ion Battery Safety SOP',
    sub: 'Handling and thermal safety',
    Icon: FileText,
  },
  {
    label: 'Soldering & Micro-jumpers Guide',
    sub: 'Logic board diagnostic standard',
    Icon: History,
  },
]

/**
 * Popular services data for mobile horizontal scroll
 */
export const POPULAR_SERVICES = [
  {
    title: 'Screen Replacement',
    sub: 'Starts from ₹1,299',
    bg: 'linear-gradient(135deg,#1a1a2e,#0d1117)',
    image: '/images/home-banner-top.png',
  },
  {
    title: 'Battery Replacement',
    sub: 'Starts from ₹999',
    bg: 'linear-gradient(135deg,#0a1628,#050f1e)',
    image: '/images/dark-microchip-bg.png',
  },
  {
    title: 'Liquid Damage',
    sub: 'Expert chemical wash',
    bg: 'linear-gradient(135deg,#1a0a2e,#0d1117)',
    image: '/images/service-smartphone-repair.png',
  },
]

/**
 * Helper function to generate device-specific manuals
 * @param {Object} device - Device object with modelRef
 * @returns {Array} Array of manual objects
 */
export function getDeviceManuals(device) {
  if (!device?.modelRef?.name) {
    return DEFAULT_MANUALS
  }

  const deviceName = device.modelRef.name

  return [
    {
      label: `${deviceName} Screen Guide`,
      sub: 'Intake and glass separation SOP',
      Icon: BookOpen,
    },
    {
      label: `${deviceName} Battery SOP`,
      sub: 'Safe extraction and adhesive release',
      Icon: FileText,
    },
    {
      label: `${deviceName} Tear-down Index`,
      sub: 'Complete components map',
      Icon: History,
    },
  ]
}

/**
 * Convert repair status to display-friendly label
 * @param {string} status - Order repair status
 * @returns {string} Display label for the status
 */
export function getDisplayStatusLabel(status) {
  switch (status) {
    case 'ORDER_PLACED':
      return 'Order Placed'
    case 'CS_CONFIRMED':
      return 'Booking Confirmed'
    case 'PICKUP_ASSIGNED':
      return 'Pickup Scheduled'
    case 'PICKUP_IN_PROGRESS':
      return 'Pickup En Route'
    case 'PICKUP_EN_ROUTE':
      return 'Pickup En Route'
    case 'DEVICE_PICKED_UP':
      return 'Device Picked Up'
    case 'RECEIVED_AT_CENTRE':
      return 'At Service Centre'
    case 'DIAGNOSIS_IN_PROGRESS':
      return 'Under Diagnosis'
    case 'DIAGNOSIS_COMPLETE':
      return 'Diagnosis Complete'
    case 'CUSTOMER_APPROVAL_PENDING':
      return 'Approval Pending'
    case 'CUSTOMER_APPROVED':
      return 'Repair Authorized'
    case 'REPAIR_IN_PROGRESS':
      return 'Repair in Progress'
    case 'REPAIR_COMPLETED':
      return 'Repair Completed'
    case 'DELIVERY_ASSIGNED':
      return 'Delivery Scheduled'
    case 'DELIVERY_IN_PROGRESS':
      return 'Out for Delivery'
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery'
    default:
      return 'In Progress'
  }
}

/**
 * Get progress bar fill percentage based on repair status
 * @param {string} status - Order repair status
 * @returns {string} CSS width percentage for progress bar
 */
export function getProgressFill(status) {
  switch (status) {
    case 'ORDER_PLACED':
      return '16%'
    case 'CS_CONFIRMED':
      return '30%'
    case 'PICKUP_ASSIGNED':
      return '40%'
    case 'PICKUP_IN_PROGRESS':
      return '50%'
    case 'PICKUP_EN_ROUTE':
      return '50%'
    case 'DEVICE_PICKED_UP':
      return '60%'
    case 'RECEIVED_AT_CENTRE':
      return '65%'
    case 'DIAGNOSIS_IN_PROGRESS':
      return '70%'
    case 'DIAGNOSIS_COMPLETE':
      return '75%'
    case 'CUSTOMER_APPROVAL_PENDING':
      return '80%'
    case 'CUSTOMER_APPROVED':
      return '85%'
    case 'REPAIR_IN_PROGRESS':
      return '90%'
    case 'REPAIR_COMPLETED':
      return '95%'
    default:
      return '65%'
  }
}
