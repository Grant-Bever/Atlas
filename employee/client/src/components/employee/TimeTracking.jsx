import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './TimeTracking.css';
import moment from 'moment-timezone'; // For better date formatting

// Helper function to check if two date objects are the same calendar day
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = moment(date1).tz('America/New_York'); // Consistent timezone
  const d2 = moment(date2).tz('America/New_York');
  return d1.isValid() && d2.isValid() && d1.isSame(d2, 'day');
};

const TimeTracking = ({ employeeId, onClockAction }) => { // Added props
  const [clockData, setClockData] = useState({ isClockedIn: false, lastEvent: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timesheetStatus, setTimesheetStatus] = useState('active');

  const fetchTimesheetStatus = useCallback(async () => {
    try {
      const response = await api.get('/api/employee-self-service/me/timesheet-status');
      setTimesheetStatus(response.data.status);
    } catch (err) {
      console.error('Failed to fetch timesheet status:', err);
    }
  }, []);

  const fetchClockData = useCallback(async () => {
    // No explicit employeeId needed for /me/ routes if auth token is used
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/employee-self-service/me/clock-status');
      const statusData = response.data;
      // Ensure statusData.recentEvents is an array, default to empty if not
      const eventHistory = Array.isArray(statusData.recentEvents) ? statusData.recentEvents : [];
      
      setClockData({ 
        isClockedIn: statusData.isClockedIn,
        lastEvent: statusData.lastEvent,
        history: eventHistory // Use the recentEvents from API for history
      });
    } catch (err) {
      console.error('Failed to fetch clock data:', err);
      setError(`Failed to fetch clock status: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClockData();
    fetchTimesheetStatus();
    // Optional: Poll for status updates (consider if really needed or use WebSockets for real-time)
    // const intervalId = setInterval(fetchClockData, 60000);
    // return () => clearInterval(intervalId);
  }, [fetchClockData, fetchTimesheetStatus]);

  const handleClockIn = async () => {
    setError(null);
    try {
      await api.post('/api/employee-self-service/me/clock-in');
      await fetchClockData(); // Refetch all clock data
      if (onClockAction) onClockAction(); // Notify parent to refresh timesheet
    } catch (err) {
      console.error('Clock In Error:', err);
      setError(`Clock In Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      await api.post('/api/employee-self-service/me/clock-out');
      await fetchClockData(); // Refetch all clock data
    } catch (err) {
      console.error('Clock Out Error:', err);
      setError(`Clock Out Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      // Ensure onClockAction is called to attempt a refresh of the timesheet,
      // regardless of the clock-out API call's success or failure.
      // If data was saved before an error, the timesheet should reflect it.
      // If data saving failed, the timesheet will refresh but show existing data.
      if (onClockAction) onClockAction();
    }
  };

  if (loading) return <div className="time-tracking status-section">Loading clock status...</div>;

  const { isClockedIn, lastEvent, history } = clockData;
  const isCurrentlyClockedIn = isClockedIn;
  const isTimesheetLocked = timesheetStatus === 'submitted' || timesheetStatus === 'approved' || timesheetStatus === 'denied';

  return (
    <div className="time-tracking">
      <div className="status-section">
        <h2>Time Tracking</h2>
        {error && <div className="error time-tracking-error">{error}</div>}
        <div className="current-status">
          <p>Status: {isCurrentlyClockedIn ? 'Clocked In' : 'Clocked Out'}</p>
          <div className="clock-buttons">
            <button 
              onClick={handleClockIn} 
              disabled={isCurrentlyClockedIn || loading || isTimesheetLocked}
              className={`clock-button ${(isCurrentlyClockedIn || isTimesheetLocked) ? 'disabled' : 'clock-in'}`}
              title={isTimesheetLocked ? 'Cannot clock in until next pay period' : ''}
            >
              Clock In
            </button>
            <button 
              onClick={handleClockOut} 
              disabled={!isCurrentlyClockedIn || loading || isTimesheetLocked}
              className={`clock-button ${(!isCurrentlyClockedIn || isTimesheetLocked) ? 'disabled' : 'clock-out'}`}
              title={isTimesheetLocked ? 'Cannot clock out until next pay period' : ''}
            >
              Clock Out
            </button>
          </div>
          {lastEvent?.eventType === 'CLOCK_OUT' && isSameDay(lastEvent?.timestamp, new Date()) && 
            <p className="clock-message">You are currently clocked out.</p>
          }
          {isTimesheetLocked && 
            <p className="clock-message warning">Time tracking is locked until next pay period.</p>
          }
        </div>
      </div>

      <div className="history-section">
        <h3>Recent Activity</h3>
        <div className="history-list">
          {history.length === 0 && !loading && <p>No recent clock events.</p>}
          {history.map(event => (
            <div key={event.id || event.timestamp} className="history-item">
              <span>{event.eventType === 'CLOCK_IN' ? '→ In' : '← Out'}</span>
              <span>{moment(event.timestamp).tz('America/New_York').format('M/D/YYYY, h:mm:ss A')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking; 