import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './Timesheet.css';
import moment from 'moment';

// Define days of the week
// const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // Not directly used anymore for rows

// Helper to format date to YYYY-MM-DD for matching with backend data
// const formatDateToYMD = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   let month = '' + (d.getMonth() + 1);
//   let day = '' + d.getDate();
//   const year = d.getFullYear();
// 
//   if (month.length < 2) month = '0' + month;
//   if (day.length < 2) day = '0' + day;
// 
//   return [year, month, day].join('-');
// };

const Timesheet = (props) => {
  const { employeeId, hourlyRate, needsRefresh, onDataLoad } = props;

  const [payPeriod, setPayPeriod] = useState(null);
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [weeklyGross, setWeeklyGross] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timesheetStatus, setTimesheetStatus] = useState('active');

  const fetchTimesheetStatus = useCallback(async () => {
    try {
      const response = await api.get('/api/employee-self-service/me/timesheet-status');
      setTimesheetStatus(response.data.status);
    } catch (err) {
      console.error('Failed to fetch timesheet status:', err);
      // Don't set error state here as it's not critical
    }
  }, []);

  const fetchTimesheetData = useCallback(async () => {
    if (!employeeId) {
        // console.log("Timesheet: Waiting for employeeId from context...");
        setLoading(false); // Stop loading if no employeeId yet
        return; 
    }

    setLoading(true);
    setError(null);
    try {
      const payPeriodRes = await api.get('/api/employee-self-service/me/pay-period/current');
      const currentPayPeriod = payPeriodRes.data;
      setPayPeriod(currentPayPeriod);

      if (currentPayPeriod && currentPayPeriod.id) {
        const entriesRes = await api.get(`/api/employee-self-service/me/timesheet-entries?payPeriodId=${currentPayPeriod.id}`);
        setTimesheetEntries(entriesRes.data.entries || []);
        if (onDataLoad) onDataLoad();
      } else {
        setTimesheetEntries([]);
      }
      
      // Fetch the timesheet status after getting entries
      await fetchTimesheetStatus();
    } catch (err) {
      console.error('Failed to fetch timesheet data:', err);
      setError(`Failed to load timesheet: ${err.response?.data?.message || err.message}`);
      setTimesheetEntries([]); 
      setPayPeriod(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, onDataLoad, fetchTimesheetStatus]);

  useEffect(() => {
    if (employeeId) { // Only fetch if employeeId is available
        fetchTimesheetData();
    }
  }, [fetchTimesheetData, needsRefresh, employeeId]);

  useEffect(() => {
    if (timesheetEntries && timesheetEntries.length > 0 && typeof hourlyRate !== 'undefined') {
      const totalGross = timesheetEntries.reduce((acc, entry) => {
        return acc + (parseFloat(entry.hoursWorked) * parseFloat(hourlyRate));
      }, 0);
      setWeeklyGross(totalGross.toFixed(2));
    } else {
      setWeeklyGross(0);
    }
  }, [timesheetEntries, hourlyRate]);

  const handleSubmitTimesheet = async () => {
    if (!payPeriod || !payPeriod.id) {
      setError('Cannot submit: Pay period information is missing.');
      return;
    }
    // Backend uses 'active', frontend might have used 'Open' from mock
    if (payPeriod.status !== 'active') { 
        setError('Timesheet cannot be submitted as the pay period is not active.');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/api/employee-self-service/me/timesheet/submit', { payPeriodId: payPeriod.id });
      alert('Timesheet submitted successfully!');
      fetchTimesheetData(); 
    } catch (err) {
      console.error('Submit Timesheet Error:', err.response?.data?.message || err.message);
      setError(`Failed to submit timesheet: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false); // Ensure loading is set to false in all paths
    }
  };
  
  // Initial loading state before employeeId is confirmed from context
  if (typeof employeeId === 'undefined') {
      return <div className="employee-timesheet-container">Loading user context...</div>;
  }
  // Loading state while fetching data (and employeeId is present)
  if (loading && employeeId) return <div className="employee-timesheet-container">Loading timesheet data...</div>;
  // Error display should be more prominent if it occurs after initial context load
  if (error) return <div className="employee-timesheet-container error-message">{error}</div>;
  // If no pay period info after loading (and no error shown yet for it)
  if (!payPeriod && !loading) return <div className="employee-timesheet-container">Could not load pay period information.</div>;

  const entriesMap = new Map();
  timesheetEntries.forEach(entry => {
    // entry.date is expected to be in 'YYYY-MM-DD' format from the backend (Sequelize DATEONLY)
    if (entry && entry.date) { 
      entriesMap.set(entry.date, entry);
    }
  });

  const displayDays = [];
  if (payPeriod && payPeriod.startDate && payPeriod.endDate) {
    let currentDisplayDate = moment(payPeriod.startDate);
    const endDisplayDate = moment(payPeriod.endDate);
    while (currentDisplayDate.isSameOrBefore(endDisplayDate, 'day')) {
        displayDays.push(currentDisplayDate.clone());
        currentDisplayDate.add(1, 'day');
    }
  }
  
  // Determine if all relevant entries are submitted
  const allEntriesSubmitted = timesheetEntries.length > 0 && timesheetEntries.every(e => e.status === 'submitted');
  const isPayPeriodSubmittedOrClosed = payPeriod?.status === 'submitted' || payPeriod?.status === 'closed' || payPeriod?.status === 'paid';

  return (
    <div className="employee-timesheet-container">
      {error && !loading && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>} 
      <div className="weekly-details">
        <h2>Weekly Timesheet</h2>
        <p className="pay-period-info">
          Pay Period: {payPeriod ? new Date(payPeriod.startDate).toLocaleDateString() : 'N/A'} - {payPeriod ? new Date(payPeriod.endDate).toLocaleDateString() : 'N/A'} 
          <span className={`status-badge ${timesheetStatus}`}>
            Status: {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}
          </span>
        </p>

        <div className="timesheet-details-list">
          <div className="timesheet-details-header timesheet-details-row">
            <span>Day</span>
            <span>Date</span>
            <span>Hours Worked</span>
            <span>Daily Pay</span>
          </div>
          {displayDays.map(dateMoment => {
            const dateStr = dateMoment.format('YYYY-MM-DD');
            const dayName = dateMoment.format('dddd');
            const entry = entriesMap.get(dateStr);
            
            let displayedHoursWorked = '0.000';
            if (entry && entry.hoursWorked != null) { // Check specifically for null or undefined
              const numHours = parseFloat(entry.hoursWorked);
              if (!isNaN(numHours)) {
                displayedHoursWorked = numHours.toFixed(3);
              }
            }

            const dailyPay = (typeof hourlyRate !== 'undefined' && entry && entry.hoursWorked) ? (parseFloat(entry.hoursWorked) * parseFloat(hourlyRate)).toFixed(2) : '0.00';

            return (
              <div key={dateStr} className="timesheet-details-item timesheet-details-row">
                <span>{dayName}</span>
                <span>{dateMoment.format('M/D/YYYY')}</span>
                <span>{displayedHoursWorked}</span> 
                <span>${dailyPay}</span> 
              </div>
            );
          })}
          <div className="timesheet-details-footer timesheet-details-row">
            <span></span>
            <span></span>
            <span>Weekly Gross:</span> 
            <span>${weeklyGross}</span> 
          </div>
        </div>

        <button 
          onClick={handleSubmitTimesheet} 
          className="submit-timesheet-button"
          disabled={loading || payPeriod?.status !== 'active' || allEntriesSubmitted }
        >
          {isPayPeriodSubmittedOrClosed || allEntriesSubmitted ? 'Timesheet Submitted' : 'Submit Timesheet for Approval'}
        </button>
      </div>
    </div>
  );
};

export default Timesheet; 