import api from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    try {
      // Optional: Inform backend to invalidate/blocklist token if your backend supports it
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API failed, clearing local state anyway", error);
    }
  }
};
