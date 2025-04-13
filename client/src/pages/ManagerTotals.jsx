import React, { useState, useEffect } from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Totals.css'; // Create this CSS file

// --- Sample Data --- 
// In a real app, this would be fetched and calculated from invoice data
const sampleCustomerTotals = [
  {
    customerId: 1,
    customerName: 'Michoacano',
    dailyTotals: {
      Monday: 150.00,
      Tuesday: 0,
      Wednesday: 307.00,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
    weeklyTotal: 457.00
  },
  {
    customerId: 2,
    customerName: 'Mosner',
    dailyTotals: {
      Monday: 0,
      Tuesday: 100.00,
      Wednesday: 60.00,
      Thursday: 160.00,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
    weeklyTotal: 320.00
  },
    {
    customerId: 3,
    customerName: 'Carniceria',
    dailyTotals: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 160.00,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
    weeklyTotal: 160.00
  },
    {
    customerId: 4,
    customerName: 'Tomoe',
    dailyTotals: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 160.00,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
    weeklyTotal: 160.00
  },
    {
    customerId: 5,
    customerName: 'Regal',
    dailyTotals: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 160.00,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    },
    weeklyTotal: 160.00
  },
  // Add more customers as needed
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ManagerTotals() {
  const [customerTotals, setCustomerTotals] = useState(sampleCustomerTotals);
  const [grossRevenue, setGrossRevenue] = useState(0);

  // Calculate gross revenue
  useEffect(() => {
    const totalRevenue = customerTotals.reduce((sum, customer) => sum + customer.weeklyTotal, 0);
    setGrossRevenue(totalRevenue);
  }, [customerTotals]);

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
          customerTotals.map((customer) => (
            <div key={customer.customerId} className="customer-total-card">
              <h3>{customer.customerName}</h3>
              <div className="daily-totals-list">
                {daysOfWeek.map(day => (
                  <div key={day} className="daily-total-item">
                    <span>{day}</span>
                    <span>${(customer.dailyTotals[day] || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="card-weekly-total">
                <span>Weekly Total:</span>
                <span>${customer.weeklyTotal.toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No weekly totals data available.</p>
        )}
      </div>
    </ManagerLayout>
  );
}

export default ManagerTotals; 