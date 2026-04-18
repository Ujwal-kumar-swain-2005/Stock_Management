import api from './axiosInstance';

export const userApi = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (id, active) => {
    const response = await api.put(`/users/${id}/status`, { active });
    return response.data;
  }
};
