import api from './api';

export const slotService = {
  async getAvailableSlotsForNextDays(days = 7, centreId = null) {
    try {
      const response = await api.get('/slot/available/next-days', {
        params: { days, centreId: centreId || undefined }
      });
      // Expected backend response: { success: true, data: { dates: [...] } }
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch available slots', error);
      throw error;
    }
  }
};

export default slotService;
