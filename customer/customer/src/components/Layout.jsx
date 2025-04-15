import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

function Layout({ children }) {
  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="logo">
          <h1>Atlas Market</h1>
        </div>
        <nav className="customer-nav">
          <Link to="/">Products</Link>
          <Link to="/cart" className="cart-link">
            Cart
          </Link>
        </nav>
      </header>
      <main className="customer-main">
        {children}
      </main>
      <footer className="customer-footer">
        <p>© {new Date().getFullYear()} Atlas Market. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
