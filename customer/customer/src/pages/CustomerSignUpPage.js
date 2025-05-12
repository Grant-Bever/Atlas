import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';

const CustomerSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = async (formData) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/customer/signup', { // Updated API endpoint to be absolute
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.roleName} User`, // Or collect first/last name properly
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Sign up failed: ${result.message || 'Unknown error'}`);
        return;
      }

      alert('Customer account created successfully! Please log in.');
      navigate('/'); // Navigate to customer login page

    } catch (error) {
      console.error('Sign up request error:', error);
      alert('Sign up request failed. Please try again.');
    }
  };

  return (
    <SignUpView 
      roleName="Customer"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default CustomerSignUpPage; 