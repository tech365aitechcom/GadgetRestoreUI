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
};

export default catalogueService;
