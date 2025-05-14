import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TimeTracking from './TimeTracking';
import './EmployeeLayout.css';
import api from '../../utils/api'; // Import your api utility

const EmployeeLayout = (props) => {
  const { user, isAuthenticated } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [timesheetKey, setTimesheetKey] = useState(0);

  useEffect(() => {
    const fetchEmployeeProfile = async (employeeId) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await api.get('/api/employee-self-service/me/profile');
        setEmployeeProfile(response.data);
      } catch (err) {
        console.error('EmployeeLayout: Failed to fetch employee profile:', err);
        setProfileError(`Failed to load employee details: ${err.response?.data?.message || err.message}`);
        setEmployeeProfile(null);
      }
      setProfileLoading(false);
    };

    if (isAuthenticated && user && user.id) {
        if (typeof user.hourly_rate !== 'undefined') {
            setEmployeeProfile({
                id: user.id,
                name: user.name,
                hourly_rate: user.hourly_rate,
            });
            setProfileLoading(false);
        } else {
            fetchEmployeeProfile(user.id);
        }
    } else if (isAuthenticated && !user) {
        setProfileLoading(true); 
    } else if (!isAuthenticated) {
        setProfileLoading(false);
        setEmployeeProfile(null);
    }
  }, [user, isAuthenticated, timesheetKey]);

  if (!profileLoading && (!isAuthenticated || (isAuthenticated && user?.role !== 'employee'))) {
    return <Navigate to="/login" replace />;
  }

  const handleClockAction = () => {
    setTimesheetKey(prevKey => prevKey + 1);
  };

  if (profileLoading) {
    return <div>Loading employee information...</div>; 
  }

  if (!profileLoading && profileError) {
    return <div className="error-message" style={{padding: '20px'}}>Error loading employee data: {profileError}</div>;
  }

  if (!profileLoading && (!employeeProfile || typeof employeeProfile.hourly_rate === 'undefined')) {
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
         <Outlet context={{ employeeId: employeeProfile?.id, hourlyRate: employeeProfile?.hourly_rate, needsRefresh: timesheetKey }} />
      </main>
    </div>
  );
};

export default EmployeeLayout;

// Note: Child components (Timesheet, EmployeeOrders, etc.) will now receive these as direct props
// e.g., const Timesheet = (props) => { const { employeeId, hourlyRate, needsRefresh } = props; ... }
// instead of using useOutletContext(). 