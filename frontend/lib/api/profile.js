import { api } from './client';

export const profileApi = {
  get: () => api.get('/api/profile'),

  update: (data) => api.put('/api/profile', data),

  upgradeToPremium: () => api.post('/api/profile/upgrade-premium'),
};
