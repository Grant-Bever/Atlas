import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Timesheet.css';
import { formatTimeTo12Hour } from '../../utils/formatTime'; // Assuming you have this utility

// Define days of the week
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timesheet = () => {
  // --- Mock Data & Placeholders ---
  const MOCK_HOURLY_RATE = 20.00; // Placeholder
  const MOCK_PAY_PERIOD = {
    startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)).toISOString(),
    status: 'Open'
  };

  // Simulate initial event data for the week
  const simulateInitialEventData = () => {
    const data = {};
    let weeklyGross = 0;
    daysOfWeek.forEach((day, index) => {
      data[day] = []; // Initialize each day with an empty array
      // Simulate some data for past days (e.g., Mon-Wed)
      if (index > 0 && index < 4) { 
        const hours = 7 + Math.random() * 2;
        const dailyPay = hours * MOCK_HOURLY_RATE;
        weeklyGross += dailyPay;
        // Add simulated events
        data[day].push({ type: 'IN', time: '09:00' });
        data[day].push({ type: 'OUT', time: `${(9 + hours).toFixed(0).padStart(2, '0')}:00` });
      }
    });
    // Calculate initial weekly gross based *only* on the simulation
    // This won't update dynamically with clock events in this mock version.
    const calculatedWeeklyGross = Object.values(data).reduce((acc, dayEvents) => {
        let dailyHours = 0;
        for(let i = 0; i < dayEvents.length; i += 2) {
            if(dayEvents[i]?.type === 'IN' && dayEvents[i+1]?.type === 'OUT') {
                try {
                    const start = new Date(`1970-01-01T${dayEvents[i].time}:00`);
                    const end = new Date(`1970-01-01T${dayEvents[i+1].time}:00`);
                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                        const diffMs = end - start;
                        if (diffMs > 0) dailyHours += diffMs / (1000 * 60 * 60);
                    }
                } catch (e) { /* ignore calc error */ }
            }
        }
        return acc + (dailyHours * MOCK_HOURLY_RATE);
    }, 0);

    return { eventData: data, weeklyGross: calculatedWeeklyGross.toFixed(2) };
  };

  const { eventData: initialEventData, weeklyGross: initialWeeklyGross } = simulateInitialEventData();
  const [dailyEvents, setDailyEvents] = useState(initialEventData);
  const [mockWeeklyGross, setMockWeeklyGross] = useState(initialWeeklyGross);
  // --- End Mock Data ---

  // Keep existing state
  const [payPeriod, setPayPeriod] = useState(MOCK_PAY_PERIOD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clockStatus, setClockStatus] = useState({ isClockedIn: false });
  const [clockLoading, setClockLoading] = useState(true);

  // Keep useEffect for initial clock status fetch
  useEffect(() => {
    const fetchInitialStatus = async () => {
      setClockLoading(true);
      try {
        const response = await api.get('/api/employees/clock-status');
        setClockStatus(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch initial clock status:', err);
        setError('Failed to fetch clock status');
      } finally {
        setClockLoading(false);
      }
    };
    fetchInitialStatus();
  }, []);

  // Keep Clock In/Out Handlers
  const handleClockIn = async () => {
    setError(null);
    try {
      const clockInResponse = await api.post('/api/employees/clock-in');
      const response = await api.get('/api/employees/clock-status');
      setClockStatus(response.data);

      // --- Update Event Data for Today ---
      const today = new Date();
      const todayDayName = daysOfWeek[today.getDay()];
      const clockInTime = response.data?.lastEvent?.timestamp 
                          ? new Date(response.data.lastEvent.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                          : today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      setDailyEvents(prevData => {
        const currentDayEvents = prevData[todayDayName] || [];
        return {
          ...prevData,
          [todayDayName]: [
            ...currentDayEvents,
            { type: 'IN', time: clockInTime }
          ]
        };
      });
      // --- End Update Event Data ---

    } catch (err) {
      console.error('Clock In Error:', err.response?.data?.message || err.message);
      setError(`Failed to clock in: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      const clockOutResponse = await api.post('/api/employees/clock-out');
      const response = await api.get('/api/employees/clock-status');
      setClockStatus(response.data);

      // --- Update Event Data for Today ---
      const today = new Date();
      const todayDayName = daysOfWeek[today.getDay()];
      const clockOutTime = response.data?.lastEvent?.timestamp 
                           ? new Date(response.data.lastEvent.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                           : today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      setDailyEvents(prevData => {
        const currentDayEvents = prevData[todayDayName] || [];
        // Simple add - no pairing or hour calculation here
        return {
          ...prevData,
          [todayDayName]: [
            ...currentDayEvents,
            { type: 'OUT', time: clockOutTime }
          ]
        };
      });
      // NOTE: Daily/Weekly hour/pay totals are NOT recalculated here from mock events.
      // --- End Update Event Data ---

    } catch (err) {
      console.error('Clock Out Error:', err.response?.data?.message || err.message);
      setError(`Failed to clock out: ${err.response?.data?.message || err.message}`);
    }
  };

  // Keep Placeholder Handler for Timesheet Submission
  const handleSubmitTimesheet = async () => {
    setError(null);
    console.log("Attempting to submit timesheet...");
    // alert('Submit functionality not yet implemented on the backend.'); // Remove placeholder alert

    // --- Actual API Call --- 
    try {
      // We might need to pass identifying info, like pay period start/end or a specific ID
      // For now, the backend placeholder assumes current/latest for employee 1
      const response = await api.post('/api/employees/timesheet/submit'); 

      console.log('Timesheet submitted successfully:', response.data);
      
      // Update UI: Change pay period status locally and disable button
      setPayPeriod(prev => ({ ...prev, status: 'Submitted' }));
      alert('Timesheet submitted successfully!'); // Simple feedback

    } catch (err) {
      console.error('Submit Timesheet Error:', err.response?.data?.message || err.message);
      setError(`Failed to submit timesheet: ${err.response?.data?.message || err.message}`);
    }
    // --- End API Call --- 
  };

  if (clockLoading) return <div>Loading clock status...</div>;

  return (
    <div className="employee-timesheet-container">
      {error && <div className="error-message">{error}</div>}

      <div className="weekly-details">
        <h2>Weekly Timesheet</h2>
        <p className="pay-period-info">
          Pay Period: {new Date(payPeriod?.startDate).toLocaleDateString()} - {new Date(payPeriod?.endDate).toLocaleDateString()} 
          (Status: {payPeriod?.status})
        </p>

        <div className="timesheet-details-list">
          <div className="timesheet-details-header timesheet-details-row">
            <span>Day</span>
            <span>Clock In</span>
            <span>Clock Out</span>
            <span>Hours</span>
            <span>Daily Pay</span>
          </div>
          {daysOfWeek.map(day => {
            // Get the data for the current day from the state
            const dayData = dailyEvents[day]; 
            // Format times from the state
            const clockInFormatted = dayData?.length > 0 ? formatTimeTo12Hour(dayData[0].time) : '-';
            const clockOutFormatted = dayData?.length > 1 ? formatTimeTo12Hour(dayData[1].time) : '-';

            return (
              // Render the single summary row for the day
              <div key={day} className="timesheet-details-item timesheet-details-row">
                <span>{day}</span>
                <span>{clockInFormatted}</span>
                <span>{clockOutFormatted}</span>
                {/* Display hours/pay from state (may be inaccurate for multiple events) */}
                <span>{dayData?.length > 0 ? dayData.length / 2 : '0'}</span> 
                <span>${dayData?.length > 0 ? (dayData.length / 2) * MOCK_HOURLY_RATE : '0.00'}</span> 
              </div>
            );
          })}
          <div className="timesheet-details-footer timesheet-details-row">
            <span></span>
            <span></span>
            <span></span>
            <span>Weekly Gross (Simulated):</span> 
            <span>${mockWeeklyGross}</span> 
          </div>
        </div>

        <button 
          onClick={handleSubmitTimesheet} 
          className="submit-timesheet-button"
          disabled={payPeriod?.status !== 'Open'} 
        >
          Submit Timesheet for Approval
        </button>
      </div>

    </div>
  );
};

export default Timesheet; 