import api from './axiosInstance';

export const getAllProducts = () => api.get('/products');
export const getActiveProducts = () => api.get('/products/active');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => api.get(`/products/category/${categoryId}`);
export const getProductsBySupplier = (supplierId) => api.get(`/products/supplier/${supplierId}`);
export const searchProducts = (keyword) => api.get('/products/search', { params: { keyword } });
export const getLowStockProducts = () => api.get('/products/low-stock');
export const getExpiringProducts = (days = 30) => api.get('/products/expiring', { params: { days } });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
