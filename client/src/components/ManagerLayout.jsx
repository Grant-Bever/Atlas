import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/ManagerLayout.css';

function ManagerLayout({ children, pageTitle }) {
  const getCurrentDate = () => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className="manager-layout">
      <Sidebar />
      <div className="main-content">
        <header className="main-header">
          <h2 className="page-title-header">{pageTitle || 'Page Title'}</h2>
          <span className="current-date">{getCurrentDate()}</span>
        </header>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ManagerLayout; 