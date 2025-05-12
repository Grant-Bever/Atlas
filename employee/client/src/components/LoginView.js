import React, { useState } from 'react';
import './LoginView.css';
// import logo from '../../../../customer/customer/src/logo.svg'; // Removed old logo import

const LoginView = ({ onSignInSubmit, onSignUpClick, roleName }) => {
  const logoPath = process.env.PUBLIC_URL + '/assets/Atlas-Logo-Final.png';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      alert('Email and password are required.');
      return;
    }
    await onSignInSubmit(email, password);
  };

  return (
    <div className="login-view-container">
      <div className="login-logo-container">
        <img src={logoPath} className="app-logo" alt="App Logo" />
      </div>
      <h2>{roleName} Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="signin-button">
          Sign In
        </button>
        <p className="signup-prompt">
          Don't have an account?{' '}
          <button type="button" className="signup-button" onClick={onSignUpClick}>
            Sign Up
          </button>
        </p>

      </form>
    </div>
  );
};

export default LoginView; 