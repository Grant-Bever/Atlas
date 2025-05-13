import React, { useState, useEffect } from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Totals.css'; // Ensure this CSS file exists
import { API_BASE_URL } from '../utils/config';

// Base URL for the API
const API_ENDPOINT = `${API_BASE_URL}/api`;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ManagerTotals() {
  const [customerTotals, setCustomerTotals] = useState([]);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyTotals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_ENDPOINT}/totals/weekly`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCustomerTotals(data);

        // Calculate gross revenue from fetched data
        const totalRevenue = data.reduce((sum, customer) => {
            // Sum up the daily totals for each customer to get their weekly total
            const weeklyCustTotal = customer.dailyTotals.reduce((dailySum, dailyVal) => dailySum + dailyVal, 0);
            return sum + weeklyCustTotal;
        }, 0);
        setGrossRevenue(totalRevenue);

      } catch (e) {
        console.error("Failed to fetch weekly totals:", e);
        setError("Failed to load weekly totals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyTotals();
    // Optionally add a timer to refresh weekly, or rely on page reload/navigation

  }, []); // Fetch once on mount

  // Display loading state
  if (loading) {
      return <ManagerLayout pageTitle="Weekly Customer Totals"><div className="loading-indicator">Loading totals...</div></ManagerLayout>;
  }

  // Display error state
  if (error) {
      return <ManagerLayout pageTitle="Weekly Customer Totals"><div className="error-message">{error}</div></ManagerLayout>;
  }

  return (
    <ManagerLayout pageTitle="Weekly Customer Totals">
      <div className="totals-summary-bar">
        <div className="gross-revenue">
          <span>WEEKLY GROSS REVENUE:</span>
          <span>${grossRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="totals-grid">
        {customerTotals.length > 0 ? (
          customerTotals.map((customer) => {
            // Calculate weekly total on the frontend for display
            const weeklyTotal = customer.dailyTotals.reduce((sum, daily) => sum + daily, 0);
            return (
                <div key={customer.customerId} className="customer-total-card">
                <h3>{customer.customerName}</h3>
                <div className="daily-totals-list">
                    {daysOfWeek.map((day, index) => (
                    <div key={day} className="daily-total-item">
                        <span>{day}</span>
                        {/* Access the daily total using the index (0=Mon, 6=Sun) */}
                        <span>${(customer.dailyTotals[index] || 0).toFixed(2)}</span>
                    </div>
                    ))}
                </div>
                <div className="card-weekly-total">
                    <span>Weekly Total:</span>
                    <span>${weeklyTotal.toFixed(2)}</span>
                </div>
                </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', fontStyle: 'italic', width: '100%' }}>
              No weekly totals data available for the current week.
          </p>
        )}
      </div>
    </ManagerLayout>
  );
}

export default ManagerTotals; 