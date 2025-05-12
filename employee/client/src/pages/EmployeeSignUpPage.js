import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpView from '../components/SignUpView';

const EmployeeSignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSubmit = (formData) => {
    // Placeholder for actual account creation logic (Employee)
    // API call to backend to save to 'employee' table.
    console.log('Employee Account Creation Data:', formData);
    alert(`Employee account creation for ${formData.email} simulated. Data would be sent to backend.\nRedirecting to login page.`);
    
    // Database columns to consider for 'employee' table:
    // - employee_id (Primary Key)
    // - email (Unique, Indexed)
    // - password_hash
    // - phone_number (Nullable)
    // - first_name, last_name (Likely needed for an employee)
    // - role (e.g., 'cashier', 'cook', if applicable)
    // - manager_id (Foreign key if managed by someone)
    // - created_at, updated_at

    navigate('/'); // Navigate to employee login page
  };

  return (
    <SignUpView 
      roleName="Employee"
      onSubmit={handleSignUpSubmit} 
    />
  );
};

export default EmployeeSignUpPage; 