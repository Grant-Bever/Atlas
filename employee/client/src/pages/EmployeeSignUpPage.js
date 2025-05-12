import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';

const EmployeeSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = async (formData) => {
    try {
      const response = await fetch('/api/auth/employee/signup', { // Updated API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.name}`, 
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Sign up failed: ${result.message || 'Unknown error'}`);
        return;
      }

      alert('Employee account created successfully! Please log in.');
      navigate('/'); // Navigate to employee login page

    } catch (error) {
      console.error('Sign up request error:', error);
      alert('Sign up request failed. Please try again.');
    }
  };

  return (
    <SignUpView 
      roleName="Employee"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default EmployeeSignUpPage; 