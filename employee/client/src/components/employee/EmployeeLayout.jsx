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
        <TimeTracking />
        <div className="nav-header">
          <h2>Employee Dashboard</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/employee/timesheet">Timesheet</Link>
          </li>
          <li>
            <Link to="/employee/orders">Active Orders</Link>
          </li>
          <li>
            <Link to="/employee/inventory">Inventory</Link>
          </li>
        </ul>
      </nav>
      <main className="employee-content">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout; 