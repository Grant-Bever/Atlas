import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = {
  // Product endpoints
  getProducts: () => axios.get(`${API_BASE_URL}/customer/products`),
  getProductsByCategory: (categoryId) => axios.get(`${API_BASE_URL}/customer/products/${categoryId}`),
  
  // Order endpoints
  createOrder: (orderData) => axios.post(`${API_BASE_URL}/customer/orders`, orderData),
  getOrders: (customerId) => axios.get(`${API_BASE_URL}/customer/orders/${customerId}`),
  getOrderDetails: (orderId) => axios.get(`${API_BASE_URL}/customer/orders/details/${orderId}`),
};

export default api;
