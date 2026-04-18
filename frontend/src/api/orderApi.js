import api from './axiosInstance';

export const getAllOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrdersByType = (type) => api.get(`/orders/type/${type}`);
export const getOrdersByStatus = (status) => api.get(`/orders/status/${status}`);
export const createOrder = (data) => api.post('/orders', data);
export const confirmOrder = (id) => api.put(`/orders/${id}/confirm`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } });
