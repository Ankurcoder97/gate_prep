import api from './api';

export const testService = {
  generateTest: async (config) => {
    const res = await api.post('/tests/generate', config);
    return res.data;
  },

  getTestById: async (id) => {
    const res = await api.get(`/tests/${id}`);
    return res.data;
  },

  startTest: async (id) => {
    const res = await api.post(`/tests/${id}/start`);
    return res.data;
  },

  saveAnswer: async (testId, answerData) => {
    const res = await api.post(`/tests/${testId}/answer`, answerData);
    return res.data;
  },

  submitTest: async (testId, payload = {}) => {
    const res = await api.post(`/tests/${testId}/submit`, payload);
    return res.data;
  },

  getTestResult: async (id) => {
    const res = await api.get(`/tests/${id}/result`);
    return res.data;
  },

  getTestHistory: async () => {
    const res = await api.get('/tests/history');
    return res.data;
  },
};
