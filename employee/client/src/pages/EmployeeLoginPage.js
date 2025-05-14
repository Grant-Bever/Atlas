import React from 'react';
import { useHistory } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { useAuth } from '../contexts/AuthContext';

const EmployeeLoginPage = () => {
  const history = useHistory();

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
      error={loginError}
    />
  );
};

export default EmployeeLoginPage; 