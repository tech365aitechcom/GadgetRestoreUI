import api from './api';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';

async function downloadDocument(path, filename) {
  const response = await api.get(path, { responseType: 'arraybuffer' });

  // Validate we got actual PDF data (PDF files start with %PDF)
  const buffer = response.data;
  console.log('[Download] Response size:', buffer.byteLength, 'bytes, filename:', filename);

  if (!buffer || buffer.byteLength < 100) {
    console.error('[Download] Response too small to be a valid PDF:', buffer?.byteLength);
    throw new Error('Invalid PDF received from server');
  }

  // Create blob from arraybuffer — guarantees we have the raw binary, not gzip
  const blob = new Blob([buffer], { type: 'application/pdf' });

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
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
          globalThis.URL.revokeObjectURL(url);
        }, 1000);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        alert('Unable to download file. Please try again.');
      }
    }
  } else {
    // Web browser: use traditional download approach
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body, click, then remove (more reliable)
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Clean up
    setTimeout(() => {
      globalThis.URL.revokeObjectURL(url);
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

function createBlobFromBase64(base64Data) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'application/pdf' });
}

async function getBase64Data(downloadUrl, isDataUrl) {
  if (isDataUrl) {
    return downloadUrl.split(',')[1];
  }
  const pdfResponse = await fetch(downloadUrl);
  const blob = await pdfResponse.blob();
  return blobToBase64(blob);
}

async function handleNativePdfDownload(filename, base64Data, dialogTitle = 'Open PDF with') {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const result = await Filesystem.writeFile({
    path: sanitizedFilename,
    data: base64Data,
    directory: Directory.Cache,
  });

  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    await Share.share({
      title: filename,
      url: result.uri,
      dialogTitle,
    });
  } else {
    await Share.share({
      title: filename,
      url: result.uri,
    });
  }
}

function handleWebPdfDownload(downloadUrl, isDataUrl, filename) {
  if (isDataUrl) {
    const base64Data = downloadUrl.split(',')[1];
    const blob = createBlobFromBase64(base64Data);

    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => globalThis.URL.revokeObjectURL(url), 100);
  } else {
    window.open(downloadUrl, '_blank');
  }
}

export const orderService = {
  async getOrders(page = 1, limit = 10) {
    const response = await api.get('/customer/orders', {
      params: {
        page,
        limit,
      },
    });

    const data = response.data?.data || response.data;
    const pagination = data?.pagination || {};

    return {
      orders: data?.orders || [],
      totalCount: pagination?.totalItems || 0,
      currentPage: pagination?.currentPage || page,
      totalPages: pagination?.totalPages || 1,
      hasNext: pagination?.hasNext || false,
      hasPrev: pagination?.hasPrev || false,
    };
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
    try {
      const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/invoice/download`);
      const downloadUrl = response.data?.data?.downloadUrl || response.data?.downloadUrl;
      const filename = response.data?.data?.filename || `Invoice-${ticketNumber}.pdf`;

      if (!downloadUrl) throw new Error('Download URL not received from server');

      const isDataUrl = downloadUrl.startsWith('data:');
      if (Capacitor.isNativePlatform()) {
        const base64Data = await getBase64Data(downloadUrl, isDataUrl);
        await handleNativePdfDownload(filename, base64Data, 'Open PDF with');
      } else {
        handleWebPdfDownload(downloadUrl, isDataUrl, filename);
      }
    } catch (error) {
      console.error('[downloadInvoice] Error:', error);
      throw error;
    }
  },

  async downloadConfirmation(ticketNumber) {
    try {
      const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/confirmation/download`);
      const downloadUrl = response.data?.data?.downloadUrl || response.data?.downloadUrl;
      const filename = response.data?.data?.filename || `Order-Confirmation-${ticketNumber}.pdf`;

      if (!downloadUrl) throw new Error('Download URL not received from server');

      const isDataUrl = downloadUrl.startsWith('data:');
      if (Capacitor.isNativePlatform()) {
        const base64Data = await getBase64Data(downloadUrl, isDataUrl);
        await handleNativePdfDownload(filename, base64Data, 'Open PDF with');
      } else {
        handleWebPdfDownload(downloadUrl, isDataUrl, filename);
      }
    } catch (error) {
      console.error('[downloadConfirmation] Error:', error);
      throw error;
    }
  },

  async downloadWarranty(ticketNumber) {
    try {
      const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/warranty/download`);
      const downloadUrl = response.data?.data?.downloadUrl || response.data?.downloadUrl;
      const filename = response.data?.data?.filename || `Warranty-${ticketNumber}.pdf`;

      if (!downloadUrl) throw new Error('Download URL not received from server');

      const isDataUrl = downloadUrl.startsWith('data:');
      if (Capacitor.isNativePlatform()) {
        const base64Data = await getBase64Data(downloadUrl, isDataUrl);
        await handleNativePdfDownload(filename, base64Data, 'Open PDF with');
      } else {
        handleWebPdfDownload(downloadUrl, isDataUrl, filename);
      }
    } catch (error) {
      console.error('[downloadWarranty] Error:', error);
      throw error;
    }
  },

  async shareWarranty(ticketNumber) {
    try {
      const response = await api.get(`/customer/orders/${encodeURIComponent(ticketNumber)}/warranty/download`);
      const downloadUrl = response.data?.data?.downloadUrl || response.data?.downloadUrl;
      const filename = response.data?.data?.filename || `Warranty-${ticketNumber}.pdf`;

      if (!downloadUrl) throw new Error('Download URL not received from server');

      const isDataUrl = downloadUrl.startsWith('data:');
      
      if (Capacitor.isNativePlatform()) {
        const base64Data = await getBase64Data(downloadUrl, isDataUrl);
        await handleNativePdfDownload(filename, base64Data, 'Share PDF with');
        return true;
      } else {
        // Web browser
        let blob;
        if (isDataUrl) {
          blob = createBlobFromBase64(downloadUrl.split(',')[1]);
        } else {
          const pdfResponse = await fetch(downloadUrl);
          blob = await pdfResponse.blob();
        }
        
        const file = new File([blob], filename, { type: 'application/pdf' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Warranty Card - ${ticketNumber}`,
            text: `Digital warranty card for order ${ticketNumber}`,
          });
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('[shareWarranty] Error:', error);
      throw error;
    }
  },
};

export default orderService;
