import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Employees.css'; // Create this CSS file
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload } from 'react-icons/fa';
import { formatTimeTo12Hour } from '../utils/formatTime'; // Import the utility function

// --- Sample Data ---
// In a real app, employee details and hours would come from the backend.
const sampleEmployees = [
  {
    employeeId: 101,
    name: 'Alice Johnson',
    hourlyWage: 20.00,
    timesheet: {
      Monday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Tuesday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Wednesday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Thursday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Friday: { clockIn: '09:00', clockOut: '17:00', hours: 8, dailyPay: 160.00 },
      Saturday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Sunday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
    },
    weeklyGross: 800.00
  },
  {
    employeeId: 102,
    name: 'Bob Smith',
    hourlyWage: 18.50,
    timesheet: {
      Monday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Tuesday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Wednesday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Thursday: { clockIn: '10:00', clockOut: '18:00', hours: 8, dailyPay: 148.00 },
      Friday: { clockIn: '10:00', clockOut: '14:00', hours: 4, dailyPay: 74.00 },
      Saturday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
      Sunday: { clockIn: '-', clockOut: '-', hours: 0, dailyPay: 0 },
    },
    weeklyGross: 518.00
  },
   // Add more employees as needed
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ManagerEmployees() {
  const [employees, setEmployees] = useState(sampleEmployees);
  const [totalWeeklyExpense, setTotalWeeklyExpense] = useState(0);

  // Calculate total weekly salary expense
  useEffect(() => {
    const totalExpense = employees.reduce((sum, emp) => sum + emp.weeklyGross, 0);
    setTotalWeeklyExpense(totalExpense);
  }, [employees]);

  return (
    <ManagerLayout pageTitle="Employees">
       {/* Add controls bar */}
       <div className="page-actions-bar">
            <div className="total-salary-expense">
                <span>TOTAL WEEKLY EXPENSE:</span>
                <span>${totalWeeklyExpense.toFixed(2)}</span>
            </div>
            <Link to="/employees/add" className="button button-primary add-employee-button">
                <FaPlus /> Add Employee
            </Link>
       </div>

      {/* Employee Cards Grid */}
      <div className="employees-grid">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div key={employee.employeeId} className="employee-card">
              <h3>{employee.name}</h3>
               {/* Using a simple list for timesheet display */}
              <div className="timesheet-list">
                 <div className="timesheet-header-row">
                     <span>Day</span>
                     <span>Clock In</span>
                     <span>Clock Out</span>
                     <span>Daily Pay</span>
                 </div>
                {daysOfWeek.map(day => {
                  const dayData = employee.timesheet[day] || { clockIn: '-', clockOut: '-', dailyPay: 0 };
                  return (
                    <div key={day} className="timesheet-item">
                      <span>{day}</span>
                      {/* Format the times */}
                      <span>{formatTimeTo12Hour(dayData.clockIn)}</span>
                      <span>{formatTimeTo12Hour(dayData.clockOut)}</span>
                      <span>${dayData.dailyPay.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card-weekly-gross">
                <span>Weekly Gross:</span>
                <span>${employee.weeklyGross.toFixed(2)}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No employee data available. Add an employee to get started.</p>
        )}
      </div>
    </ManagerLayout>
  );
}

export default ManagerEmployees; 