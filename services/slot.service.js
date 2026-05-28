import api from './api';

export const slotService = {
  /**
   * Fetch available slots for the next N days.
   * @param {number} days - Number of days to fetch slots for (default 7)
   */
  async getAvailableSlotsForNextDays(days = 7) {
    try {
      const response = await api.get('/slot/available/next-days', {
        params: { days }
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
