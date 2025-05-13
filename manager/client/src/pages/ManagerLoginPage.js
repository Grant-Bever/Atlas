import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { API_BASE_URL } from '../utils/config';

const ManagerLoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/manager/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed. Please check your credentials.');
        return false;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Manager Login successful, token stored:', data.token);
        navigate('/orders'); // Navigate to Manager Active Orders page
        return true;
      } else {
        console.error('Login successful, but no token received from server.', data);
        alert('Login successful, but no token received. Please contact support.');
        return false;
      }

    } catch (error) {
      console.error('Login request error:', error);
      alert('An error occurred during login. Please try again.');
      return false;
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <LoginView 
      roleName="Manager"
      onSignInSubmit={handleLoginSubmit}
      onSignUpClick={handleSignUpClick} 
    />
  );
};

export default ManagerLoginPage; 