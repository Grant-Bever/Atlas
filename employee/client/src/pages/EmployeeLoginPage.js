import React from 'react';
import { useHistory } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { API_BASE_URL } from '../utils/config';

const EmployeeLoginPage = () => {
  const history = useHistory();

  const handleLoginSubmit = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employee/login`, {
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

      console.log('Employee Login successful:', data);
      history.push('/employee/timesheet');
      return true;

    } catch (error) {
      console.error('Login request error:', error);
      alert('An error occurred during login. Please try again.');
      return false;
    }
  };

  const handleSignUpClick = () => {
    history.push('/signup');
  };

  return (
    <LoginView 
      roleName="Employee"
      onSignInSubmit={handleLoginSubmit}
      onSignUpClick={handleSignUpClick} 
    />
  );
};

export default EmployeeLoginPage; 