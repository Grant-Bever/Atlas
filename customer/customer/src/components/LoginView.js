import React from 'react';
import './LoginView.css';
// import logo from '../logo.svg'; // Removed old logo import

const LoginView = ({ onSignIn, onSignUp, roleName }) => {
  const logoPath = process.env.PUBLIC_URL + '/assets/Atlas-Logo-Final.png';
  return (
    <div className="login-view-container">
      <div className="login-logo-container">
        <img src={logoPath} className="app-logo" alt="App Logo" />
      </div>
      <h2>{roleName} Login</h2>
      <form className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="button" className="signin-button" onClick={onSignIn}>
          Sign In
        </button>
        <p className="signup-prompt">
          Don't have an account?{' '}
          <button type="button" className="signup-button" onClick={onSignUp}>
            Sign Up
          </button>
        </p>

        <div className="social-login-options">
          <p className="social-login-text">Or sign in with:</p>
          <button type="button" className="social-signin-button google-button" onClick={() => console.log('Google Sign In Clicked')}>
            Sign In with Google
          </button>
          <button type="button" className="social-signin-button outlook-button" onClick={() => console.log('Outlook Sign In Clicked')}>
            Sign In with Outlook
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginView; 