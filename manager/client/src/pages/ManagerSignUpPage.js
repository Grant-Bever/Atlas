import React from 'react';
import { useHistory } from 'react-router-dom';
import SignUpView from '../components/SignUpView';
import { API_BASE_URL } from '../utils/config';

const ManagerSignUpPage = () => {
  const history = useHistory();

  const handleSignUpSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/manager/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password, 
          name: `${formData.roleName} User`, // Or collect first/last name in form
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Sign up failed: ${result.message || 'Unknown error'}`);
        return;
      }

      alert('Manager account created successfully! Please log in.');
      history.push('/');

    } catch (error) {
      console.error('Sign up request error:', error);
      alert('Sign up request failed. Please try again.');
    }
  };

  return (
    <SignUpView 
      roleName="Manager"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default ManagerSignUpPage; 