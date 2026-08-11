import { api } from '../lib/api';

export const itemService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/items${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  adjustStock: (id, data) => api.post(`/items/${id}/adjust`, data),
  recordSale: (id, data) => api.post(`/items/${id}/sale`, data),
};