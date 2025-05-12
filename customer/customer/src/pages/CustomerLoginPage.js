import React from 'react';
import LoginView from '../components/LoginView';
import { useNavigate } from 'react-router-dom';

const CustomerLoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display error message from backend if available, otherwise a generic one
        alert(data.message || 'Login failed. Please check your credentials.');
        return false; // Indicate failure
      }

      // Login successful
      console.log('Login successful:', data); // Log response for now
      // TODO: Store user info/token if necessary (e.g., in context or localStorage)
      navigate('/products'); // Navigate to the products page
      return true; // Indicate success

    } catch (error) {
      console.error('Login request error:', error);
      alert('An error occurred during login. Please try again.');
      return false; // Indicate failure
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <LoginView 
      roleName="Customer"
      onSignInSubmit={handleLoginSubmit} // Pass the new handler
      onSignUpClick={handleSignUpClick} 
    />
  );
};

export default CustomerLoginPage; 