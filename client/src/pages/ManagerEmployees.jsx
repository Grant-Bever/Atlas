import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Employees.css'; // Create this CSS file
import '../styles/Table.css'; // Reusing action menu styles from Table.css
import '../styles/Modal.css'; // Reusing modal styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaEllipsisV } from 'react-icons/fa';
import { formatTimeTo12Hour } from '../utils/formatTime'; // Import the utility function

// --- Sample Data ---
// In a real app, employee details and hours would come from the backend.
const sampleEmployees = [
  {
    employeeId: 101,
    name: 'Alice Johnson',
    hourlyWage: 20.00,
    jobTitle: 'Lead Butcher',
    dateHired: '2023-01-15',
    phoneNumber: '555-123-4567',
    email: 'alice.j@example.com',
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
    jobTitle: 'Cashier',
    dateHired: '2023-06-01',
    phoneNumber: '555-987-6543',
    email: 'bob.s@example.com',
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
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(sampleEmployees);
  const [totalWeeklyExpense, setTotalWeeklyExpense] = useState(0);
  const [openEmployeeMenuId, setOpenEmployeeMenuId] = useState(null); // State for employee action menu
  const [fireModalState, setFireModalState] = useState({ isOpen: false, employeeId: null, employeeName: '' }); // State for fire confirmation

  // Calculate total weekly salary expense
  useEffect(() => {
    const totalExpense = employees.reduce((sum, emp) => sum + emp.weeklyGross, 0);
    setTotalWeeklyExpense(totalExpense);
  }, [employees]);

  // --- Employee Action Menu --- 
  const handleEmployeeMenuToggle = (e, employeeId) => {
    e.stopPropagation(); // Prevent card click/etc.
    setOpenEmployeeMenuId(prevId => (prevId === employeeId ? null : employeeId));
  };

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openEmployeeMenuId !== null && !event.target.closest('.employee-action-menu-container')) {
        setOpenEmployeeMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openEmployeeMenuId]);

  // --- Action Handlers --- 
  const handleEditEmployee = (e, employeeId) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null);
    navigate(`/employees/edit/${employeeId}`);
  };

  const handleFireClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null);
    setFireModalState({ isOpen: true, employeeId: employeeId, employeeName: employeeName });
  };

  // --- Modal Handlers --- 
  const handleConfirmFire = () => {
    const { employeeId, employeeName } = fireModalState;
    console.log(`Firing employee: ${employeeName} (ID: ${employeeId})`);
    // TODO: API call to fire employee (update status, restrict access)
    setEmployees(prev => prev.filter(emp => emp.employeeId !== employeeId));
    setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
  };

  const handleCancelFire = () => {
    setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
  };

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
          employees.map((employee) => {
            const isMenuOpen = openEmployeeMenuId === employee.employeeId;
            return (
              <div key={employee.employeeId} className="employee-card">
                {/* Card Header with Name and Action Menu */}
                <div className="employee-card-header">
                  <h3>{employee.name}</h3>
                  <div className="employee-action-menu-container action-menu-container"> { /* Re-use container class */}
                     <button 
                        onClick={(e) => handleEmployeeMenuToggle(e, employee.employeeId)} 
                        className="icon-button menu-dots-button"> { /* Re-use button class */}
                       <FaEllipsisV />
                     </button>
                     {isMenuOpen && (
                        <div className="action-menu"> { /* Re-use menu class */}
                           <button onClick={(e) => handleEditEmployee(e, employee.employeeId)}><FaEdit /> Edit</button>
                           <button onClick={(e) => handleFireClick(e, employee.employeeId, employee.name)} className="danger"><FaTrashAlt /> Fire</button>
                        </div>
                     )}
                  </div>
                </div>
                
                {/* Timesheet List */}
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
            );
          })
        ) : (
          <p>No employee data available. Add an employee to get started.</p>
        )}
      </div>

      {/* Fire Confirmation Modal */}
      {fireModalState.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirm Firing Employee</h4>
            <p>Are you sure you want to fire <strong>{fireModalState.employeeName}</strong>? This action cannot be undone and will restrict their access.</p>
            <div className="modal-actions">
              <button onClick={handleCancelFire} className="button button-secondary">Cancel</button>
              <button onClick={handleConfirmFire} className="button button-danger">Confirm Fire</button> { /* Optional: different style */}
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

export default ManagerEmployees; 