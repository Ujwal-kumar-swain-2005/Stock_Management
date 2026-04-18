import api from './axiosInstance';

export const getAllAlerts = () => api.get('/alerts');
export const getLowStockAlerts = () => api.get('/alerts/low-stock');
export const getExpiryAlerts = (days = 30) => api.get('/alerts/expiry', { params: { days } });
