import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './TimeTracking.css';

// Helper function to check if two date objects are the same calendar day
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = (date1 instanceof Date) ? date1 : new Date(date1);
  const d2 = (date2 instanceof Date) ? date2 : new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const TimeTracking = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/api/employees/clock-status');
      setStatus(response.data);
    } catch (err) {
      setError('Failed to fetch status');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/employees/clock-history');
      setHistory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch history');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchHistory();
    // Poll for status updates every minute
    const intervalId = setInterval(fetchStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleClockIn = async () => {
    try {
      await api.post('/api/employees/clock-in');
      fetchStatus();
      fetchHistory();
    } catch (err) {
      setError('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/api/employees/clock-out');
      fetchStatus();
      fetchHistory();
    } catch (err) {
      setError('Failed to clock out');
    }
  };

  if (loading) return <div>Loading...</div>;
  // Don't show component error here, let parent handle maybe
  // if (error) return <div className="error">{error}</div>; 

  // Determine if the last action was clocking out today
  const now = new Date();
  const lastEvent = status?.lastEvent;
  const isClockedOutToday = lastEvent?.eventType === 'CLOCK_OUT' && isSameDay(lastEvent?.timestamp, now);

  return (
    <div className="time-tracking">
      <div className="status-section">
        <h2>Time Tracking</h2>
        {error && <div className="error time-tracking-error">{error}</div>} {/* Show error within component */}
        <div className="current-status">
          <p>Status: {status?.isClockedIn ? 'Clocked In' : 'Clocked Out'}</p>
          <div className="clock-buttons">
            <button 
              onClick={handleClockIn} 
              // Disable if already clocked in OR if clocked out today
              disabled={status?.isClockedIn || isClockedOutToday}
              className={`clock-button ${(status?.isClockedIn || isClockedOutToday) ? 'disabled' : 'clock-in'}`}
            >
              Clock In
            </button>
            <button 
              onClick={handleClockOut} 
              // Disable if not clocked in OR if clocked out today
              disabled={!status?.isClockedIn || isClockedOutToday}
              className={`clock-button ${(!status?.isClockedIn || isClockedOutToday) ? 'disabled' : 'clock-out'}`}
            >
              Clock Out
            </button>
          </div>
            {/* Optional: Message shown when buttons disabled due to clock out */} 
            {isClockedOutToday && 
              <p className="clock-message">Clocked out for the day.</p>
            }
        </div>
      </div>

      <div className="history-section">
        <h3>Recent Activity</h3>
        <div className="history-list">
          {history.map(event => (
            <div key={event.id} className="history-item">
              <span>{event.eventType === 'CLOCK_IN' ? '→ In' : '← Out'}</span>
              <span>{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking; 