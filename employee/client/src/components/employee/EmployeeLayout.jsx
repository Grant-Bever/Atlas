import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TimeTracking from './TimeTracking';
// import Timesheet from './Timesheet'; // Unused import
// import TimesheetStatus from './TimesheetStatus'; // Unused import
import './EmployeeLayout.css';

const EmployeeLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated or not an employee
  if (!isAuthenticated || user?.role !== 'employee') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="employee-layout">
      <nav className="employee-nav">
        <div className="nav-header">
          <h2>Employee Dashboard</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <TimeTracking />
      </nav>
      <main className="employee-content">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout; 