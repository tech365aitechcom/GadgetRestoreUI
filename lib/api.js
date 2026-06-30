/**
 * API Utility Functions
 * Centralized API calls to cs-back backend
 */

import { API_BASE_URL } from './constants'

/**
 * Submit a support contact request
 * @param {Object} data - Contact form data
 * @returns {Promise<Object>} Response data
 */
export async function submitSupportContact(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferredDate: data.date,
        preferredTime: data.time,
        service: data.service,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit support request')
    }

    return result
  } catch (error) {
    console.error('Error submitting support contact:', error)
    throw error
  }
}

/**
 * Generic API call helper
 * @param {string} endpoint - API endpoint (e.g., '/api/booking')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export async function apiCall(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'API request failed')
    }

    return result
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}
