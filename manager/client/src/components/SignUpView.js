import React, { useState } from 'react';
import './SignUpView.css'; 
// We assume logo is handled by public/assets path now, so no direct import needed for logo file here unless specific structure

const SignUpView = ({ roleName, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const logoPath = process.env.PUBLIC_URL + '/assets/Atlas-Logo-Final.png';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Email and basic presence validation (already exists)
    if (!email || !password) {
      setError('Email and Password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    // Password confirmation (already exists)
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // New Password Strength Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-~`+=;'\[\]\\\/\|]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    // New Phone Number Validation (if provided)
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    // If all validations pass
    onSubmit({ email, password, phoneNumber, roleName });
  };

  return (
    <div className="signup-view-container">
      <div className="signup-logo-container">
        <img src={logoPath} className="app-logo" alt="App Logo" />
      </div>
      <h2>Create {roleName} Account</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password*</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password*</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number (Optional)</label>
          <input 
            type="tel" 
            id="phoneNumber" 
            name="phoneNumber" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <button type="submit" className="create-account-button">
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignUpView; 