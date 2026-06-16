import api from './api';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';

async function downloadDocument(path, filename) {
  const response = await api.get(path, { responseType: 'blob' });
  const blob = response.data;

  // Check if we're running on a native mobile platform (iOS or Android)
  const isNativeMobile = Capacitor.isNativePlatform();

  if (isNativeMobile) {
    try {
      // Convert blob to base64
      const base64Data = await blobToBase64(blob);

      // Sanitize filename - remove special characters
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Save file to device's cache directory (easier to access)
      const result = await Filesystem.writeFile({
        path: sanitizedFilename,
        data: base64Data,
        directory: Directory.Cache,
      });

      console.log('File saved successfully to:', result.uri);

      // Get platform
      const platform = Capacitor.getPlatform();

      if (platform === 'android') {
        // On Android, use Share API to open PDF with available apps
        try {
          await Share.share({
            title: filename,
            text: `Open ${filename}`,
            url: result.uri,
            dialogTitle: 'Open PDF with',
          });
        } catch (shareError) {
          console.error('Share failed, trying Browser:', shareError);
          // Fallback: try opening with Browser plugin
          await Browser.open({
            url: result.uri,
            presentationStyle: 'fullscreen',
          });
        }
      } else if (platform === 'ios') {
        // On iOS, use Share API which works well
        await Share.share({
          title: filename,
          url: result.uri,
        });
      } else {
        // Fallback for other platforms
        window.open(result.uri, '_system');
      }

    } catch (error) {
      console.error('Error handling file on native device:', error);

      // Fallback: try creating a downloadable link
      try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        alert('Unable to download file. Please try again.');
      }
    }
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

// Helper function to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the data URL prefix to get just the base64 string
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
