import { api } from './client';

export const ordersApi = {
  getMyOrders: () => api.get('/api/orders'),

  getCustomerOrders: () => api.get('/api/orders/customer'),

  getBusinessOrders: () => api.get('/api/orders/business'),

  getById: (id) => api.get(`/api/orders/${id}`),

  create: (order) => api.post('/api/orders', order),

  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),

  cancel: (id) => api.post(`/api/orders/${id}/cancel`),
};
