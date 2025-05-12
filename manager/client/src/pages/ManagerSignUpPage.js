import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';

const ManagerSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = (formData) => {
    // Placeholder for actual account creation logic (Manager)
    // API call to backend to save to 'manager' table.
    console.log('Manager Account Creation Data:', formData);
    alert(`Manager account creation for ${formData.email} simulated. Data would be sent to backend.\nRedirecting to login page.`);

    // Database columns to consider for 'manager' table:
    // - manager_id (Primary Key)
    // - email (Unique, Indexed)
    // - password_hash
    // - phone_number (Nullable)
    // - first_name, last_name
    // - permissions_level (e.g., if different types of managers)
    // - created_at, updated_at
    
    navigate('/'); // Navigate to manager login page
  };

  return (
    <SignUpView 
      roleName="Manager"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default ManagerSignUpPage; 