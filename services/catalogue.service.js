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

  /**
   * Get available tiers for specific repairs
   * POST /api/pricing-matrix/available-tiers
   * Returns array of repairs with their available tiers and pricing
   */
  async getAvailableTiers({ brandId, modelId, repairTypeIds }) {
    try {
      const response = await api.post('/pricing-matrix/available-tiers', {
        brandId,
        modelId,
        repairTypeIds,
      });
      return response.data.data || response.data || { repairs: [] };
    } catch (error) {
      console.error('Failed to get available tiers', error);
      throw error;
    }
  },

  /**
   * Fetch pricing matrix for SEO landing pages (public endpoint).
   * GET /api/pricing-matrix/seo-pricing
   * Params: { brand, slug }
   */
  async getSEOPricing({ brand, slug }) {
    try {
      const params = { brand };
      if (slug) params.slug = slug;
      const response = await api.get('/pricing-matrix/seo-pricing', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch SEO pricing', error);
      throw error;
    }
  },

  /**
   * Search models/products by name (public catalogue search)
   * @param {string} name — search query
   */
  async searchProducts(name) {
    try {
      const response = await api.get('/catalogue/products/search', {
        params: { name, limit: 10 }
      });
      return response.data.products || response.data || [];
    } catch (error) {
      console.error('Failed to search products', error);
      throw error;
    }
  },
};

export default catalogueService;
