import api from './api';

function collectRepairTypeIds(symptoms = []) {
  const ids = new Set();

  symptoms.forEach((symptom) => {
    (symptom.repairTypes || []).forEach((repairType) => {
      const id = typeof repairType === 'object' ? repairType._id : repairType;
      if (id) ids.add(id);
    });
  });

  return [...ids];
}

function toBookingAddress(address) {
  if (!address) return undefined;

  return {
    addressLine1: address.addressLine1 || address.line1,
    addressLine2: address.addressLine2 || address.line2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
}

export const bookingService = {
  async createBooking({
    brand,
    model,
    symptoms,
    partTier,
    serviceMode,
    remarks,
    address,
    slot,
    customerData,
  }) {
    const payload = {
      // Customer Information (Required)
      customerName: customerData?.customerName,
      customerPhone: customerData?.customerPhone,
      customerEmail: customerData?.customerEmail,

      // Device Information (Required)
      brandId: brand._id,
      modelId: model._id,

      // Repair Information (Required)
      symptomIds: symptoms.map((symptom) => symptom._id),
      repairTypeIds: collectRepairTypeIds(symptoms),
      symptomDescription: remarks || undefined,

      // Part & Service Details
      partTier: partTier.tier,

      // Booking Details
      source: 'App',
      bookingType: 'Pickup',
      slotDate: slot?.date,
      slotTime: slot?.timeSlot,

      // Service Center (from schedule page)
      serviceCentre: slot?.centreId || undefined,

      // Address (for Pickup)
      address: toBookingAddress(address),

      // Optional Customer Fields
      alternatePhone: customerData?.alternatePhone || undefined,

      // Device Password (optional but important)
      devicePassword: customerData?.devicePassword || undefined,
    };

    // Remove undefined values to keep payload clean
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const response = await api.post('/booking', payload, {
      timeout: 45000  // 45 seconds for booking creation (long-running operation)
    });

    return response.data?.data || response.data;
  },

  async getCustomerOrder(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}`);
    return response.data?.data?.order || response.data?.order;
  },
};

export default bookingService;
