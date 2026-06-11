import api from './api';
import { Capacitor } from '@capacitor/core';

async function downloadDocument(path, filename) {
  const response = await api.get(path, { responseType: 'blob' });
  const blob = response.data;

  // Check if we're running on a native mobile platform (iOS or Android)
  const isNativeMobile = Capacitor.isNativePlatform();

  if (isNativeMobile) {
    // For native mobile apps, open in new tab to allow native handling
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    // If popup blocked, fallback to current window
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }

    // Clean up after a delay to ensure the download starts
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } else {
    // Web browser: use traditional download approach
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body, click, then remove (more reliable)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

export const orderService = {
  async getOrders() {
    const response = await api.get('/customer/orders', {
      params: { limit: 50 },
    });

    return response.data?.data?.orders || response.data?.orders || [];
  },

  async getOrderDetails(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}`);
    return response.data?.data?.order || response.data?.order;
  },

  async getApproval(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/approval`);
    return response.data?.data?.approval || response.data?.approval;
  },

  async approveDiagnosis(ticketNumber) {
    const response = await api.post(`/customer/orders/${encodeURIComponent(ticketNumber)}/approval/approve`);
    return response.data?.data || response.data;
  },

  async discussDiagnosis(ticketNumber) {
    const response = await api.post(`/customer/orders/${encodeURIComponent(ticketNumber)}/approval/discuss`, {
      reason: 'Customer requested a support call to discuss revised cost.',
    });
    return response.data?.data || response.data;
  },

  async getInvoice(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/invoice`);
    return response.data?.data?.invoice || response.data?.invoice || null;
  },

  async getWarranty(ticketNumber) {
    const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/warranty`);
    return response.data?.data?.warranty || response.data?.warranty || null;
  },

  async downloadInvoice(ticketNumber) {
    return downloadDocument(
      `/customer/orders/${encodeURIComponent(ticketNumber)}/invoice/download`,
      `Invoice-${ticketNumber}.pdf`,
    );
  },

  async downloadConfirmation(ticketNumber) {
    return downloadDocument(
      `/customer/orders/${encodeURIComponent(ticketNumber)}/confirmation/download`,
      `Order-Confirmation-${ticketNumber}.pdf`,
    );
  },

  async downloadWarranty(ticketNumber) {
    return downloadDocument(
      `/customer/orders/${encodeURIComponent(ticketNumber)}/warranty/download`,
      `Warranty-${ticketNumber}.pdf`,
    );
  },
};

export default orderService;
