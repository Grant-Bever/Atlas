import React from 'react';
import LoginView from '../components/LoginView';
import { useNavigate } from 'react-router-dom';

const EmployeeLoginPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Placeholder for sign-in logic
    // Later, integrate Firebase and redirect to employee dashboard
    console.log('Employee Sign In Clicked');
    alert('Employee Sign In - To be implemented');
  };

  const handleSignUp = () => {
    navigate('/signup'); // Navigate to Employee Sign Up page
  };

  return (
    <LoginView
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      roleName="Employee"
    />
  );
};

export default EmployeeLoginPage; 