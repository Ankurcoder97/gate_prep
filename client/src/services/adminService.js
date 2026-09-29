import api from './api';

export const adminService = {
  getAdminStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getBlueprints: async () => {
    const res = await api.get('/admin/blueprints');
    return res.data;
  },

  createBlueprint: async (data) => {
    const res = await api.post('/admin/blueprints', data);
    return res.data;
  },
};
