import { api } from './client';

export const productsApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.district) searchParams.set('district', params.district);
    if (params.businessId) searchParams.set('businessId', params.businessId);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return api.get(`/api/products${query ? `?${query}` : ''}`);
  },

  getById: (id) => api.get(`/api/products/${id}`),

  create: (product) => api.post('/api/products', product),

  update: (id, product) => api.put(`/api/products/${id}`, product),

  delete: (id) => api.delete(`/api/products/${id}`),
};
