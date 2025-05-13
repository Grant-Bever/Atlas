import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';
import { API_BASE_URL } from '../utils/config';

const EmployeeSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employee/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Sign up failed. Please try again.');
        return false;
      }

      alert('Account created successfully! Please login.');
      navigate('/login');
      return true;

    } catch (error) {
      console.error('Sign up request error:', error);
      alert('An error occurred during sign up. Please try again.');
      return false;
    }
  };

  return (
    <SignUpView 
      roleName="Employee"
      onSignUpSubmit={handleSignUpSubmit}
    />
  );
};

export default EmployeeSignUpPage; 