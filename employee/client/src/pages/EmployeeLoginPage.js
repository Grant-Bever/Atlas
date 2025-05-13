import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { useAuth } from '../contexts/AuthContext';

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error } = useAuth();
  const [loginError, setLoginError] = useState(null);

  // If already authenticated, redirect to the timesheet page
  if (isAuthenticated) {
    return <Navigate to="/employee/timesheet" replace />;
  }

  const handleLoginSubmit = async (email, password) => {
    setLoginError(null);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        console.log('Employee Login successful');
        navigate('/employee/timesheet');
        return true;
      } else {
        // The login function will have set the error in the AuthContext
        setLoginError(error || 'Login failed. Please check your credentials.');
        return false;
      }
    } catch (err) {
      console.error('Login request error:', err);
      setLoginError('An error occurred during login. Please try again.');
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