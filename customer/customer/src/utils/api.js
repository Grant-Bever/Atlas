import axios from 'axios';
import { API_BASE_URL } from './config';

const api = {
  // Product endpoints
  getProducts: () => axios.get(`${API_BASE_URL}/api/customer/products`),
  getProductsByCategory: (categoryId) => axios.get(`${API_BASE_URL}/api/customer/products/category/${categoryId}`),
  getCategories: () => axios.get(`${API_BASE_URL}/api/customer/categories`),
  
  // Order endpoints
  createOrder: (orderData) => axios.post(`${API_BASE_URL}/api/customer/orders`, orderData),
  getOrders: (customerId) => axios.get(`${API_BASE_URL}/api/customer/orders/${customerId}`),
  getOrderDetails: (orderId) => axios.get(`${API_BASE_URL}/api/customer/orders/details/${orderId}`),
};

export default api;
