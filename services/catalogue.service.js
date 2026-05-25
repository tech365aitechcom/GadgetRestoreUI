import api from './api';

export const catalogueService = {
  /**
   * Fetch all active brands for brand selection.
   * @param {string|null} categoryId — optional; filters to brands in that category.
   */
  async getBrands(categoryId = null) {
    try {
      const params = { limit: 100 };
      if (categoryId) params.categoryId = categoryId;
      const response = await api.get('/catalogue/brands', { params });
      // Backend returns { brands: [...], totalbrands, ... }
      return response.data.brands || response.data || [];
    } catch (error) {
      console.error('Failed to fetch brands', error);
      throw error;
    }
  },

  /**
   * Fetch all models (products) for a specific brand.
   * @param {string} brandId — required.
   */
  async getModelsByBrand(brandId) {
    try {
      const response = await api.get('/catalogue/brands/models', {
        params: { brandId },
      });
      // Backend returns { products: [...] }
      return response.data.products || [];
    } catch (error) {
      console.error('Failed to fetch models for brand', error);
      throw error;
    }
  },

  /**
   * Fetch all active categories (Mobile, Laptop, iPad, etc.)
   */
  async getCategories() {
    try {
      const response = await api.get('/catalogue/categories');
      return response.data.categories || response.data || [];
    } catch (error) {
      console.error('Failed to fetch categories', error);
      throw error;
    }
  },

  /**
   * Fetch symptoms for a specific device category.
   * @param {string} deviceCategory — e.g. "Mobile", "Laptop", "mobile" (case-insensitive)
   *
   * NOTE: We normalise to lowercase before sending. The backend also performs
   * a case-insensitive regex match, so either side alone is sufficient –
   * having both layers avoids any future regression.
   */
  async getSymptoms(deviceCategory) {
    try {
      // Normalise: "Mobile" → "mobile", "LAPTOP" → "laptop"
      const normalised = (deviceCategory || '').toLowerCase();
      const response = await api.get('/symptoms', {
        params: { deviceCategory: normalised, limit: 100 }
      });
      // Backend returns { success: true, symptoms: [...] }
      return response.data.symptoms || response.data || [];
    } catch (error) {
      console.error('Failed to fetch symptoms', error);
      throw error;
    }
  },

  /**
   * Fetch all active part quality tiers (Pro, Premium) from the backend.
   * GET /api/part-tiers?limit=10
   * No auth required — public GET endpoint.
   */
  async getPartTiers() {
    try {
      const response = await api.get('/part-tiers', { params: { limit: 10 } });
      // Backend returns { success, partTiers: [...] }
      const tiers = response.data.partTiers || response.data || [];
      return tiers.filter(t => t.isActive !== false);
    } catch (error) {
      console.error('Failed to fetch part tiers', error);
      throw error;
    }
  },

  /**
   * Check pricing availability for selected repair types + tier combination.
   * POST /api/pricing-matrix/check-availability
   * Body: { brandId, modelId, repairTypeIds[], partTier }
   * Returns { allAvailable, results: [{ repairTypeId, available, pricing }] }
   */
  async checkPricingAvailability({ brandId, modelId, repairTypeIds, partTier }) {
    try {
      const response = await api.post('/pricing-matrix/check-availability', {
        brandId,
        modelId,
        repairTypeIds,
        partTier,
      });
      return response.data.data || response.data || { allAvailable: false, results: [] };
    } catch (error) {
      console.error('Failed to check pricing availability', error);
      throw error;
    }
  },
};

export default catalogueService;
