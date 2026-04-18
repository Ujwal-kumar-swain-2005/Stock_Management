import api from './axiosInstance';

export const getSalesReport = (startDate, endDate) =>
  api.get('/reports/sales', { params: { startDate, endDate } });

export const getPurchaseReport = (startDate, endDate) =>
  api.get('/reports/purchases', { params: { startDate, endDate } });

export const getInventoryReport = () => api.get('/reports/inventory');

export const getExpiryReport = (days = 30) =>
  api.get('/reports/expiry', { params: { days } });
