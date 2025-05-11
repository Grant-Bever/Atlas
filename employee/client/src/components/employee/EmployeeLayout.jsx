import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TimeTracking from './TimeTracking';
import './EmployeeLayout.css';
import api from '../../utils/api'; // Import your api utility

const EmployeeLayout = () => {
  const { user, isAuthenticated } = useAuth(); // user from AuthContext might just have id, role, name
  const [employeeProfile, setEmployeeProfile] = useState(null); // Will store { id, name, hourly_rate, ... }
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [timesheetKey, setTimesheetKey] = useState(0);

  useEffect(() => {
    const fetchEmployeeProfile = async (employeeId) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await api.get('/api/employee-self-service/me/profile');
        setEmployeeProfile(response.data); // Expecting { id, name, email, phone, hourly_rate }
      } catch (err) {
        console.error('EmployeeLayout: Failed to fetch employee profile:', err);
        setProfileError(`Failed to load employee details: ${err.response?.data?.message || err.message}`);
        setEmployeeProfile(null); // Clear profile on error
      }
      setProfileLoading(false);
    };

    if (isAuthenticated && user && user.id) {
        // If user from AuthContext has hourly_rate, use it directly (optional optimization)
        if (typeof user.hourly_rate !== 'undefined') {
            setEmployeeProfile({
                id: user.id,
                name: user.name,
                hourly_rate: user.hourly_rate,
                // ...any other fields from AuthContext user that are part of profile
            });
            setProfileLoading(false);
        } else {
            // Otherwise, fetch the full profile from the dedicated endpoint
            fetchEmployeeProfile(user.id);
        }
    } else if (isAuthenticated && !user) {
        // Authenticated but user object not yet populated in context, wait for AuthContext update
        setProfileLoading(true); 
    } else if (!isAuthenticated) {
        setProfileLoading(false); // Not authenticated, no profile to load
        setEmployeeProfile(null);
    }
  }, [user, isAuthenticated]);

  if (!isAuthenticated || (isAuthenticated && user?.role !== 'employee')) {
    return <Navigate to="/login" replace />;
  }

  const handleClockAction = () => {
    setTimesheetKey(prevKey => prevKey + 1);
  };

  if (profileLoading) {
    return <div>Loading employee information...</div>; 
  }

  if (profileError) {
    return <div className="error-message" style={{padding: '20px'}}>Error loading employee data: {profileError}</div>;
  }

  // After loading, check if we actually got the profile and hourly_rate
  if (!employeeProfile || typeof employeeProfile.hourly_rate === 'undefined') {
    console.warn('EmployeeLayout: Employee profile loaded but hourly_rate is still missing.');
    return <div>Employee data is incomplete (missing hourly rate). Please contact support.</div>;
  }

  return (
    <div className="employee-layout">
      <nav className="employee-nav">
        <div className="nav-header">
          <h2>Employee Dashboard</h2>
          <p>Welcome, {employeeProfile.name}</p>
        </div>
        <TimeTracking 
          employeeId={employeeProfile.id} 
          onClockAction={handleClockAction} 
        />
      </nav>
      <main className="employee-content">
         <Outlet context={{ employeeId: employeeProfile.id, hourlyRate: employeeProfile.hourly_rate, needsRefresh: timesheetKey }} />
      </main>
    </div>
  );
};

export default EmployeeLayout;

// And in your Timesheet.jsx, you would use useOutletContext:
// import { useOutletContext } from 'react-router-dom';
// const Timesheet = () => {
//   const { employeeId, hourlyRate, needsRefresh } = useOutletContext();
//   ... rest of your Timesheet component ...
// }; 