import { api } from '../lib/api';

export const reportService = {
  // startDate & endDate in YYYY-MM-DD format
  getSummary: (startDate, endDate) =>
    api.get(`/reports/summary?start=${startDate}&end=${endDate}`),

  getDaily: (startDate, endDate) =>
    api.get(`/reports/daily?start=${startDate}&end=${endDate}`),
};