import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './TimesheetApproval.css';

const TimesheetApproval = () => {
  const [pendingTimesheets, setPendingTimesheets] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingTimesheets();
  }, []);

  const fetchPendingTimesheets = async () => {
    try {
      const response = await api.get('/timesheet/pending');
      setPendingTimesheets(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch pending timesheets');
      setLoading(false);
    }
  };

  const handleApprove = async (timesheetId) => {
    try {
      await api.put(`/timesheet/approve/${timesheetId}`);
      fetchPendingTimesheets();
    } catch (err) {
      setError('Failed to approve timesheet');
    }
  };

  const handleDeny = async (timesheetId) => {
    try {
      await api.put(`/timesheet/deny/${timesheetId}`, { feedback });
      setFeedback('');
      fetchPendingTimesheets();
    } catch (err) {
      setError('Failed to deny timesheet');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="timesheet-approval">
      <h2>Pending Timesheets</h2>
      <div className="timesheet-list">
        {pendingTimesheets.map(timesheet => (
          <div key={timesheet.id} className="timesheet-item">
            <div className="timesheet-header">
              <h3>Employee: {timesheet.employee.name}</h3>
              <span>Submission #{timesheet.submissionCount}</span>
            </div>
            <div className="timesheet-details">
              <p>Week of: {new Date(timesheet.startDate).toLocaleDateString()}</p>
              <p>Total Hours: {timesheet.totalHours}</p>
            </div>
            <div className="approval-actions">
              <textarea
                placeholder="Feedback (required for denial)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="buttons">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(timesheet.id)}
                >
                  Approve
                </button>
                <button 
                  className="deny-btn"
                  onClick={() => handleDeny(timesheet.id)}
                  disabled={!feedback.trim()}
                >
                  Deny
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimesheetApproval; 