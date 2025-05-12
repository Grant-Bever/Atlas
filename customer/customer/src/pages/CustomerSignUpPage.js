import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';

const CustomerSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = (formData) => {
    // Placeholder for actual account creation logic
    // This would involve an API call to your backend to:
    // 1. Validate data server-side (again)
    // 2. Check if email already exists
    // 3. Hash the password
    // 4. Save the new user to the 'customer' table in the database
    console.log('Customer Account Creation Data:', formData);
    alert(`Customer account creation for ${formData.email} simulated. Data would be sent to backend.\nRedirecting to login page.`);
    
    // Database columns to consider for 'customer' table:
    // - user_id (Primary Key)
    // - email (Unique, Indexed)
    // - password_hash (Hashed password, not plain text!)
    // - phone_number (Nullable)
    // - created_at
    // - updated_at
    // - any other customer-specific fields (e.g., name, address_id)

    // Redirect to the login page after successful (simulated) sign-up
    navigate('/'); // Assuming '/' is the login page route for customers
  };

  return (
    <SignUpView 
      roleName="Customer"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default CustomerSignUpPage; 