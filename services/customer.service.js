import Cookies from 'js-cookie'
import { API_BASE_URL, TOKEN_COOKIE } from '@/lib/constants'

class CustomerService {
  /**
   * Get headers with authentication token
   */
  getAuthHeaders() {
    const token = Cookies.get(TOKEN_COOKIE)
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data?.message || 'An error occurred')
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }

  /**
   * GET /api/customer/profile
   * Retrieve authenticated customer's complete profile
   */
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch profile')
      }

      const res = await response.json()
      return res.data
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * PUT /api/customer/profile
   * Update customer's profile information
   * @param {Object} data - { fullName, email, alternativeMobile }
   */
  async updateProfile(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * POST /api/customer/addresses
   * Add a new address to customer's profile
   * @param {Object} addressData - { address: {...}, setAsDefault: Boolean }
   */
  async addAddress(addressData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(addressData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add address')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * PUT /api/customer/addresses/:addressId
   * Update an existing address
   * @param {String} addressId - MongoDB ObjectId of address
   * @param {Object} addressData - { address: {...}, setAsDefault: Boolean }
   */
  async updateAddress(addressId, addressData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/addresses/${addressId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(addressData),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update address')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * DELETE /api/customer/addresses/:addressId
   * Remove an address from customer's profile
   * @param {String} addressId - MongoDB ObjectId of address
   */
  async deleteAddress(addressId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/addresses/${addressId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete address')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * GET /api/customer/orders
   * Get paginated order/ticket history for customer
   * @param {Object} params - { page, limit, status }
   */
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)

      const url = `${API_BASE_URL}/api/customer/orders${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch orders')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * GET /api/customer/orders/:ticketNumber
   * Get detailed information for a specific order/ticket
   * @param {String} ticketNumber - Ticket number
   */
  async getOrderDetails(ticketNumber) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/orders/${ticketNumber}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch order details')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * PUT /api/customer/preferences
   * Update customer's notification preferences
   * @param {Object} preferences - { whatsappNotifications, smsNotifications, emailNotifications, pushNotifications }
   */
  async updatePreferences(preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update preferences')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * POST /api/customer/logout
   * Logout from all devices by invalidating all tokens
   */
  async logoutAllDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to logout')
      }

      // Clear local token
      Cookies.remove(TOKEN_COOKIE)

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * DELETE /api/customer/account
   * Delete customer account (soft delete for GDPR compliance)
   */
  async deleteAccount() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/account`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete account')
      }

      // Clear local token
      Cookies.remove(TOKEN_COOKIE)

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }
}

// Export singleton instance
const customerService = new CustomerService()
export default customerService
