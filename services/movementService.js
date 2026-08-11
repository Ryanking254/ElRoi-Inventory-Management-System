import { api } from '../lib/api';

export const movementService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/movements${query ? `?${query}` : ''}`);
  },
};