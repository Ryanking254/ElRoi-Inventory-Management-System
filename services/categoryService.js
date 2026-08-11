import { api } from '../lib/api';

export const categoryService = {
  getAll: () => api.get('/categories'),

  create: (name) => api.post('/categories', { name }),

  update: (id, data) => api.put(`/categories/${id}`, data),

  remove: (id) => api.delete(`/categories/${id}`),
};