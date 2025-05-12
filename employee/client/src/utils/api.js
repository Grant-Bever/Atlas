import axios from 'axios';

// Placeholder for API utility functions
// Typically, you would configure base URL, headers, etc. here
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002', // Set base URL to backend server
  // timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
});

export default apiClient; 