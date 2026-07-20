import axios from 'axios';

// Create an Axios instance pointing to the Spring Boot REST API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the Bearer JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear local state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login (avoiding react-router hooks here as it's outside the component tree)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 400) {
        alert("Validation Error: Please check the data you entered.");
      } else if (error.response.status >= 500) {
        alert("Server Error: Something went wrong on our end. Please try again later.");
      }
    } else if (error.request) {
      alert("Network Error: Could not connect to the server. Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);

export default api;
