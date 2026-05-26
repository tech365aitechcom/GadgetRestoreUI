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
  }) {
    const response = await api.post('/booking', {
      brandId: brand._id,
      modelId: model._id,
      symptomIds: symptoms.map((symptom) => symptom._id),
      repairTypeIds: collectRepairTypeIds(symptoms),
      partTier: partTier.tier,
      source: 'App',
      bookingType: 'Pickup',
      symptomDescription: remarks || undefined,
      address: toBookingAddress(address),
      slotDate: slot?.date,
      slotTime: slot?.timeSlot,
    });

    return response.data?.data || response.data;
  },

  async getCustomerOrder(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}`);
    return response.data?.data?.order || response.data?.order;
  },
};

export default bookingService;
