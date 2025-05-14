import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { useAuth } from '../contexts/AuthContext';

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const handleLoginSubmit = async (email, password) => {
    setLoginError(null);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        console.log('Employee Login successful');
        navigate('/employee/timesheet');
        return true;
      } else {
        setLoginError('Login failed. Please check your credentials or contact support.');
        return false;
      }
    } catch (err) {
      console.error('Login request error:', err);
      setLoginError(err.message || 'An error occurred during login. Please try again.');
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
      error={loginError}
    />
  );
};

export default EmployeeLoginPage; 