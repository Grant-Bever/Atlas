import axios from 'axios';
import { API_BASE_URL } from './config';

// Configure axios with the base URL from config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
});

export default apiClient; 