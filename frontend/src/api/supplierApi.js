import api from './axiosInstance';

export const getAllSuppliers = () => api.get('/suppliers');
export const getActiveSuppliers = () => api.get('/suppliers/active');
export const getSupplierById = (id) => api.get(`/suppliers/${id}`);
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);
