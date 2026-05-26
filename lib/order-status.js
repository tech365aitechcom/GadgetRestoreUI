export const ORDER_STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed' },
  { key: 'CS_CONFIRMATION_PENDING', label: 'Confirmation Pending' },
  { key: 'CS_CONFIRMED', label: 'Confirmed' },
  { key: 'PICKUP_ASSIGNED', label: 'Pickup Scheduled' },
  { key: 'PICKUP_EN_ROUTE', label: 'Pickup En Route' },
  { key: 'DEVICE_PICKED_UP', label: 'Device Picked Up' },
  { key: 'RECEIVED_AT_CENTRE', label: 'At Service Centre', aliases: ['DEVICE_AT_CENTRE', 'PICKUP_COMPLETED'] },
  { key: 'DIAGNOSIS_PENDING', label: 'Under Diagnosis' },
  { key: 'DIAGNOSIS_COMPLETED', label: 'Diagnosis Complete' },
  { key: 'PENDING_ADVANCE_PAYMENT', label: 'Advance Payment Required' },
  { key: 'CUSTOMER_APPROVAL_PENDING', label: 'Awaiting Approval' },
  { key: 'CUSTOMER_APPROVED', label: 'Approved for Repair' },
  { key: 'REPAIR_IN_PROGRESS', label: 'Repair Started' },
  { key: 'REPAIR_COMPLETED', label: 'Repair Done' },
  { key: 'FQC_PENDING', label: 'Quality Check Pending' },
  { key: 'FQC_PASSED', label: 'Quality Checked' },
  { key: 'DELIVERY_ASSIGNED', label: 'Delivery Scheduled' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function canonicalOrderStatus(status) {
  const matchedStep = ORDER_STEPS.find(
    (step) => step.key === status || step.aliases?.includes(status),
  );

  return matchedStep?.key || status;
}
