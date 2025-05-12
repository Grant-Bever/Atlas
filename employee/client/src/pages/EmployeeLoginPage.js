import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';

const EmployeeLoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSubmit = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/employee/login', {
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
      navigate('/employee/timesheet'); // Navigate to the employee timesheet page via layout
      return true;

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
      roleName="Employee"
      onSignInSubmit={handleLoginSubmit}
      onSignUpClick={handleSignUpClick} 
    />
  );
};

export default EmployeeLoginPage; 