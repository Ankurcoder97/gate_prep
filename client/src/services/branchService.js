import api from './api';

export const branchService = {
  getAllBranches: async () => {
    const res = await api.get('/branches');
    return res.data;
  },

  getBranchDetails: async (id) => {
    const res = await api.get(`/branches/${id}`);
    return res.data;
  },

  createBranch: async (data) => {
    const res = await api.post('/branches', data);
    return res.data;
  },

  updateBranch: async (id, data) => {
    const res = await api.put(`/branches/${id}`, data);
    return res.data;
  },

  deleteBranch: async (id) => {
    const res = await api.delete(`/branches/${id}`);
    return res.data;
  },

  getSubjectsByBranch: async (branchId) => {
    const res = await api.get(`/subjects/branch/${branchId}`);
    return res.data;
  },

  createSubject: async (data) => {
    const res = await api.post('/subjects', data);
    return res.data;
  },

  updateSubject: async (id, data) => {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  },

  deleteSubject: async (id) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },

  getTopicsBySubject: async (subjectId) => {
    const res = await api.get(`/topics/subject/${subjectId}`);
    return res.data;
  },

  createTopic: async (data) => {
    const res = await api.post('/topics', data);
    return res.data;
  },

  updateTopic: async (id, data) => {
    const res = await api.put(`/topics/${id}`, data);
    return res.data;
  },

  deleteTopic: async (id) => {
    const res = await api.delete(`/topics/${id}`);
    return res.data;
  },
};
