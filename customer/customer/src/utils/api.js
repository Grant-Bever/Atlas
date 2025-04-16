import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/customer';
// Define the actual API root for non-customer-specific endpoints
const API_ROOT = 'http://localhost:3002/api';

const api = {
  // Product endpoints
  getProducts: () => axios.get(`${API_BASE_URL}/products`),
  getProductsByCategory: (categoryId) => axios.get(`${API_BASE_URL}/products/category/${categoryId}`),
  getCategories: () => axios.get(`${API_BASE_URL}/categories`),
  
  // Order endpoints
  createOrder: (orderData) => axios.post(`${API_ROOT}/orders`, orderData),
  getOrders: (customerId) => axios.get(`${API_ROOT}/orders/${customerId}`),
  getOrderDetails: (orderId) => axios.get(`${API_ROOT}/orders/details/${orderId}`),
};

export default api;
