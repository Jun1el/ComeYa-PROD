import { api } from './client';

export const superadminApi = {
  getMetrics: () => api.get('/api/superadmin/metrics'),
};
