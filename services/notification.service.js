import api from './api';

export const notificationService = {
  /**
   * Get all notifications for authenticated customer
   * @param {Object} params - { page, limit, unreadOnly, eventType }
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead() {
    try {
      const response = await api.delete('/notifications/read');
      return response.data;
    } catch (error) {
      console.error('Failed to delete all read notifications:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all notifications for a specific ticket
   * @param {string} ticketNumber
   */
  async getNotificationsByTicket(ticketNumber) {
    try {
      const response = await api.get(`/notifications/ticket/${ticketNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get notifications for ticket ${ticketNumber}:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single notification details
   * @param {string} notificationId
   */
  async getNotificationById(notificationId) {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get notification details for ${notificationId}:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete notification (soft delete)
   * @param {string} notificationId
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      throw error.response?.data || error;
    }
  },

  async registerPushDevice(payload) {
    try {
      const response = await api.post('/notifications/push/devices', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to register push device:', error);
      throw error.response?.data || error;
    }
  },

  async unregisterPushDevice(payload) {
    try {
      const response = await api.delete('/notifications/push/devices', { data: payload });
      return response.data;
    } catch (error) {
      console.error('Failed to unregister push device:', error);
      throw error.response?.data || error;
    }
  },

  async sendTestPush() {
    try {
      const response = await api.post('/notifications/push/test');
      return response.data;
    } catch (error) {
      console.error('Failed to send test push:', error);
      throw error.response?.data || error;
    }
  },
};

export default notificationService;
