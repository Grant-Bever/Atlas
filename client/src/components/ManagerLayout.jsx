import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/ManagerLayout.css';

function ManagerLayout({ children }) {
  const getCurrentDate = () => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className="manager-layout">
      <Sidebar />
      <div className="main-content">
        <header className="main-header">
          {/* Dynamic Date */}
          <span className="current-date">{getCurrentDate()}</span>
        </header>
        <div className="page-content">
          {children} {/* Where the specific page content will be rendered */}
        </div>
      </div>
    </div>
  );
}

export default ManagerLayout; 