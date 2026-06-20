import { api } from './client';

export const businessesApi = {
  getAll: () => api.get('/api/businesses'),

  getById: (id) => api.get(`/api/businesses/${id}`),

  getMyBusiness: () => api.get('/api/businesses/my-business'),

  create: (business) => api.post('/api/businesses', business),

  update: (id, business) => api.put(`/api/businesses/${id}`, business),
};
