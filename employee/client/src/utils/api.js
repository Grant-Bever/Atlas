import axios from 'axios';
import { API_BASE_URL } from './config';

// Configure axios with the base URL from config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
});

// Add a request interceptor to include the auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - token might be expired
      console.error('Authentication error:', error.response.data?.message || 'Unauthorized');
      
      // You might want to redirect to login page or refresh token here
      // For now, just log the error
    }
    return Promise.reject(error);
  }
);

export default apiClient; 