import React from 'react';
import LoginView from '../components/LoginView';
import { useNavigate } from 'react-router-dom';

const ManagerLoginPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Placeholder for sign-in logic
    // Later, integrate Firebase and redirect to manager dashboard
    console.log('Manager Sign In Clicked');
    alert('Manager Sign In - To be implemented');
  };

  const handleSignUp = () => {
    navigate('/signup'); // Navigate to Manager Sign Up page
  };

  return (
    <LoginView
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      roleName="Manager"
    />
  );
};

export default ManagerLoginPage; 