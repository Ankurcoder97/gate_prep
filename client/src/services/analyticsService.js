import api from './api';

export const analyticsService = {
  getUserAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },
};
