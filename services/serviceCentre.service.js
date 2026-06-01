import api from './api';

const serviceCentreService = {
  getAllServiceCentres: async (params = {}) => {
    try {
      const response = await api.get('/service-centres', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching service centres:', error);
      throw error;
    }
  },
};

export default serviceCentreService;
