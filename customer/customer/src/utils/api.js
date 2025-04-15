import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/customer';

const api = {
  // Product endpoints
  getProducts: () => axios.get(`${API_BASE_URL}/products`),
  getProductsByCategory: (categoryId) => axios.get(`${API_BASE_URL}/products/category/${categoryId}`),
  getCategories: () => axios.get(`${API_BASE_URL}/categories`),
  
  // Order endpoints
  createOrder: (orderData) => axios.post(`${API_BASE_URL}/orders`, orderData),
  getOrders: (customerId) => axios.get(`${API_BASE_URL}/orders/${customerId}`),
  getOrderDetails: (orderId) => axios.get(`${API_BASE_URL}/orders/details/${orderId}`),
};

export default api;
