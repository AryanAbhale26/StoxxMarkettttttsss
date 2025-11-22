import axios from 'axios';
import API_BASE_URL from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already redirecting to avoid loops
let isRedirecting = false;

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response)
    if (!error.response) {
      // Network error - don't logout, just reject
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }

    // Only handle 401 Unauthorized errors for logout
    if (error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Don't logout if already on auth pages or already redirecting
      const authPages = ['/login', '/signup', '/forgot-password'];
      if (!authPages.includes(currentPath) && !isRedirecting) {
        const hasToken = localStorage.getItem('access_token');
        
        // Only logout if there was actually a token (real auth failure)
        if (hasToken) {
          isRedirecting = true;
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          
          // Reset flag after navigation
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
          
          window.location.href = '/login';
        }
      }
    }
    
    // For all other errors (400, 403, 404, 422, 500, etc.)
    // Just reject and let the component handle it with toast/UI feedback
    // DO NOT logout on validation errors, not found, server errors, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
