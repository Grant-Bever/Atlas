import React from 'react';
import LoginView from '../components/LoginView';
import { useNavigate } from 'react-router-dom';

const CustomerLoginPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Placeholder for sign-in logic
    // Later, integrate Firebase and redirect to customer dashboard
    console.log('Customer Sign In Clicked');
    alert('Customer Sign In - To be implemented');
  };

  const handleSignUp = () => {
    // Navigate to the Customer Sign Up page
    navigate('/signup');
  };

  return (
    <LoginView
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      roleName="Customer"
    />
  );
};

export default CustomerLoginPage; 