import api from './api';

export const paperService = {
  uploadPaper: async (formData) => {
    const res = await api.post('/papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getAllPapers: async (params = {}) => {
    const res = await api.get('/papers', { params });
    return res.data;
  },

  getPaperById: async (id) => {
    const res = await api.get(`/papers/${id}`);
    return res.data;
  },

  reprocessPaper: async (id) => {
    const res = await api.post(`/papers/${id}/reprocess`);
    return res.data;
  },

  deletePaper: async (id) => {
    const res = await api.delete(`/papers/${id}`);
    return res.data;
  },
};
