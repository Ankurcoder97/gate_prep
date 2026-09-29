import api from './api';

export const questionService = {
  getQuestions: async (params = {}) => {
    const res = await api.get('/questions', { params });
    return res.data;
  },

  getQuestionById: async (id) => {
    const res = await api.get(`/questions/${id}`);
    return res.data;
  },

  createQuestion: async (data) => {
    const res = await api.post('/questions', data);
    return res.data;
  },

  updateQuestion: async (id, data) => {
    const res = await api.put(`/questions/${id}`, data);
    return res.data;
  },

  verifyQuestion: async (id, verified = true) => {
    const res = await api.patch(`/questions/${id}/verify`, { verified });
    return res.data;
  },

  batchVerify: async (questionIds, verified = true) => {
    const res = await api.post('/questions/batch-verify', { questionIds, verified });
    return res.data;
  },

  deleteQuestion: async (id) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
};
