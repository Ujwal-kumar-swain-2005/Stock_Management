import api from './axiosInstance';

export const getAllInventory = () => api.get('/inventory');
export const getInventoryByProduct = (productId) => api.get(`/inventory/product/${productId}`);
export const getLowStockItems = () => api.get('/inventory/low-stock');
export const getTotalInventoryValue = () => api.get('/inventory/value');
export const stockIn = (data) => api.post('/inventory/stock-in', data);
export const stockOut = (data) => api.post('/inventory/stock-out', data);
export const getAllTransactions = () => api.get('/inventory/transactions');
export const getTransactionsByProduct = (productId) => api.get(`/inventory/transactions/product/${productId}`);
