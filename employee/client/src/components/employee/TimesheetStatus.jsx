import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TimesheetStatus.css';

const TimesheetStatus = ({ timesheetId }) => {
  const [status, setStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, [timesheetId]);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/timesheet/status/${timesheetId}`);
      setStatus(response.data.timesheet);
      setNotifications(response.data.notifications);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch status');
      setLoading(false);
    }
  };

  const handleResubmit = async () => {
    try {
      await api.post('/timesheet/submit', { timesheetId });
      fetchStatus();
    } catch (err) {
      setError('Failed to resubmit timesheet');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="timesheet-status">
      <div className="status-header">
        <h3>Timesheet Status</h3>
        <span className={`status-badge ${status.status}`}>
          {status.status}
        </span>
      </div>

      {status.status === 'denied' && (
        <div className="denial-feedback">
          <h4>Manager Feedback:</h4>
          <p>{status.managerFeedback}</p>
          <button onClick={handleResubmit}>Resubmit Timesheet</button>
        </div>
      )}

      <div className="notification-list">
        <h4>Notifications</h4>
        {notifications.map(notification => (
          <div key={notification.id} className="notification-item">
            <span className={`notification-type ${notification.type}`}>
              {notification.type}
            </span>
            <p>{notification.message}</p>
            <span className="notification-date">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimesheetStatus; 