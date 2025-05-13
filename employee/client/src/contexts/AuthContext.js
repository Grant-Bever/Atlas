import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// Create AuthContext
export const AuthContext = React.createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check if token exists and is valid
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      // Make a request to validate the token and get user info
      const response = await axios.get(`${API_BASE_URL}/api/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If successful, set authenticated state
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Token validation error:', err);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/employee/login`, {
        email,
        password
      });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set user and auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // If token exists in local storage but we don't have a valid AuthContext yet, 
  // create a temporary one to prevent auth errors during loading
  if (loading && localStorage.getItem('token')) {
    return (
      <AuthContext.Provider 
        value={{ 
          user: { id: null, role: 'employee' }, 
          isAuthenticated: true, 
          loading: true,
          login,
          logout,
          error
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => React.useContext(AuthContext); 