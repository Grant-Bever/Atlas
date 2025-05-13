import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Employees.css'; // Create this CSS file
import '../styles/Table.css'; // Reusing action menu styles from Table.css
import '../styles/Modal.css'; // Reusing modal styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaEllipsisV, FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';
import { formatTimeTo12Hour } from '../utils/formatTime'; // Import the utility function
import { API_BASE_URL } from '../utils/config';

// Base URL for the API
const API_ENDPOINT = `${API_BASE_URL}/api`;

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
    approvalStatus: 'Pending',
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
    approvalStatus: 'Pending',
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
  const [employeesTimesheets, setEmployeesTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // Specific error for actions
  const [totalApprovedExpense, setTotalApprovedExpense] = useState(0); // For approved expenses
  const [openEmployeeMenuId, setOpenEmployeeMenuId] = useState(null); // State for employee action menu
  const [fireModalState, setFireModalState] = useState({ isOpen: false, employeeId: null, employeeName: '' }); // State for fire confirmation
  const [confirmationModalState, setConfirmationModalState] = useState({
    isOpen: false,
    actionType: null, // 'approve' or 'deny'
    employeeId: null,
    employeeName: '',
    title: '',
    message: ''
  });

  // --- Fetch Data ---
  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null); // Clear action errors on refetch

    const token = localStorage.getItem('token'); // Or sessionStorage, or from context
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.error("No token found, cannot fetch timesheets.");
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      setEmployeesTimesheets([]);
      // navigate('/login'); // Optional: redirect to login. Make sure navigate is in deps if used.
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/employees/timesheets/weekly`, { headers }); // Pass headers
      if (!response.ok) {
        if (response.status === 401) {
           setError("Unauthorized: Could not fetch timesheets. Please ensure you are logged in as a manager and try again.");
        } else {
           setError(`HTTP error! status: ${response.status}. Failed to load timesheets.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployeesTimesheets(data);
    } catch (e) {
      console.error("Failed to fetch weekly timesheets:", e);
      if (!error) { // if setError wasn't called in the try block for a !response.ok
          setError(e.message || "Failed to load timesheets. Please try again later.");
      }
      setEmployeesTimesheets([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setEmployeesTimesheets, error]); // Added error and other setters to dependencies

  useEffect(() => {
    fetchTimesheets();
    // Note: Auto-refreshing on Mondays at 12:00 AM is complex on the client.
    // This is typically handled by backend logic (e.g., cron jobs) or simply
    // by the data naturally reflecting the current week upon fetching.
    // The fetch will always get the *current* week's data based on the server time.
  }, [fetchTimesheets]);

  // --- Calculate Total Approved Expense ---
  useEffect(() => {
    const approvedExpense = employeesTimesheets
      .filter(emp => emp.approvalStatus === 'Approved' && emp.isActive) // Only active, approved
      .reduce((sum, emp) => sum + emp.weeklyGross, 0);
    setTotalApprovedExpense(approvedExpense);
  }, [employeesTimesheets]); // Recalculate when timesheets change

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
    // TODO: Implement edit employee functionality if needed
    console.log(`Navigate to edit page for employee ${employeeId}`);
    // navigate(`/employees/edit/${employeeId}`); // Uncomment when edit page exists
  };

  const handleFireClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null);
    setFireModalState({ isOpen: true, employeeId: employeeId, employeeName: employeeName });
  };

  const handleUndoFireClick = async (e, employeeId, employeeName) => {
    e.stopPropagation();
    setOpenEmployeeMenuId(null); // Close menu if open
    setActionError(null);
    const url = `${API_ENDPOINT}/employees/${employeeId}/reinstate`;
    try {
      const response = await fetch(url, { method: 'PATCH' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reinstate employee.');
      }
      // Update local state
      setEmployeesTimesheets(prev =>
        prev.map(emp => emp.employeeId === employeeId ? { ...emp, isActive: true, firedAt: null } : emp)
      );
      console.log(`Employee ${employeeName} reinstated successfully.`);
    } catch (err) {
      console.error("Error reinstating employee:", err);
      setActionError(`Failed to reinstate ${employeeName}: ${err.message}`);
    }
  };

  // --- NEW: Timesheet Approval Handlers ---
  const handleApproveClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setConfirmationModalState({
        isOpen: true,
        actionType: 'approve',
        employeeId,
        employeeName,
        title: 'Confirm Timesheet Approval',
        message: `Approve timesheet for ${employeeName}?`
    });
  };

  const handleDenyClick = (e, employeeId, employeeName) => {
    e.stopPropagation();
    setConfirmationModalState({
        isOpen: true,
        actionType: 'deny',
        employeeId,
        employeeName,
        title: 'Confirm Timesheet Denial',
        message: `Deny timesheet for ${employeeName}?`
    });
  };

  // --- Modal Handlers --- 
  const handleConfirmFire = async () => {
    const { employeeId, employeeName } = fireModalState;
    setActionError(null);
    const url = `${API_ENDPOINT}/employees/${employeeId}/fire`;
    try {
      const response = await fetch(url, { method: 'PATCH' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fire employee.');
      }
      const updatedEmployeeData = await response.json(); // Get fired_at time
      // Update local state
      setEmployeesTimesheets(prev =>
        prev.map(emp => emp.employeeId === employeeId ? { ...emp, isActive: false, firedAt: updatedEmployeeData.employee.fired_at } : emp)
      );
      console.log(`Employee ${employeeName} fired successfully.`);
    } catch (err) {
      console.error("Error firing employee:", err);
      setActionError(`Failed to fire ${employeeName}: ${err.message}`); // Show error near actions
    } finally {
      setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
    }
  };

  const handleCancelFire = () => {
    setFireModalState({ isOpen: false, employeeId: null, employeeName: '' });
  };

  // --- NEW: Generic Confirmation Modal Handlers ---
  const handleConfirmAction = async () => {
    const { actionType, employeeId, employeeName } = confirmationModalState;
    if (!actionType || !employeeId) return;
    setActionError(null);

    const endpointAction = actionType === 'approve' ? 'approve' : 'deny';
    const url = `${API_ENDPOINT}/employees/${employeeId}/timesheets/weekly/${endpointAction}`;

    try {
      const response = await fetch(url, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${actionType} timesheet.`);
      }

      // Update local state
      setEmployeesTimesheets(prev =>
        prev.map(emp => {
          if (emp.employeeId === employeeId) {
            return { 
              ...emp, 
              approvalStatus: actionType === 'approve' ? 'Approved' : 'Denied'
            };
          }
          return emp;
        })
      );

      // Fetch updated data to ensure everything is in sync
      fetchTimesheets();
      
      console.log(`Timesheet ${actionType}d successfully for ${employeeName}.`);
    } catch (err) {
      console.error(`Error ${actionType}ing timesheet:`, err);
      setActionError(`Failed to ${actionType} timesheet for ${employeeName}: ${err.message}`);
    } finally {
      setConfirmationModalState({ isOpen: false, actionType: null, employeeId: null, employeeName: '', title: '', message: '' });
    }
  };

  const handleCancelAction = () => {
    setConfirmationModalState({ isOpen: false, actionType: null, employeeId: null, employeeName: '', title: '', message: '' });
  };

  // --- Render Logic ---
  if (loading) {
    return <ManagerLayout pageTitle="Employees & Timesheets"><div className="loading-indicator">Loading timesheets...</div></ManagerLayout>;
  }

  // Removed the top-level error display to show content + error message
  // if (error) {
  //   return <ManagerLayout pageTitle="Employees & Timesheets"><div className="error-message">{error}</div></ManagerLayout>;
  // }

  return (
    <ManagerLayout pageTitle="Employees & Timesheets">
       {/* Add controls bar */}
       <div className="page-actions-bar">
            <div className="total-salary-expense">
                <span>TOTAL WEEKLY EXPENSE (Active & Approved):</span>
                 {/* TODO: Calculate approved expense only */}
                <span>${totalApprovedExpense.toFixed(2)}</span>
            </div>
            <Link to="/employees/add" className="button button-primary add-employee-button">
                <FaPlus /> Add Employee
            </Link>
       </div>

       {/* Display error message if exists */}
        {error && <div className="error-message error-general">{error}</div>}
        {actionError && <div className="error-message error-action">{actionError}</div>}

      {/* Employee Cards Grid */}
      <div className="employees-grid">
        {employeesTimesheets.length > 0 ? (
          employeesTimesheets.map((employee) => {
            const isMenuOpen = openEmployeeMenuId === employee.employeeId;
            const isApprovedOrDenied = employee.approvalStatus === 'Approved' || employee.approvalStatus === 'Denied';
            const isFired = !employee.isActive;
            return (
              <div key={employee.employeeId} className={`employee-card status-${employee.approvalStatus.toLowerCase()} ${isFired ? 'fired' : ''}`}>
                {/* Card Header with Name, Actions, and Action Menu */}
                <div className="employee-card-header">
                    <div className="header-left"> {/* Group name and status */}
                        <h3>{employee.name}</h3>
                         {/* NEW: Display Approval Status */}
                        <div className={`approval-status ${employee.approvalStatus.toLowerCase()}`}>
                            Timesheet: {employee.approvalStatus}
                        </div>
                    </div>
                    <div className="header-right"> {/* Group buttons and menu */}
                         {/* NEW: Timesheet Approval Actions */}
                         <div className="timesheet-approval-actions">
                             <button
                                title={isApprovedOrDenied ? `Timesheet already ${employee.approvalStatus.toLowerCase()}` : (isFired ? 'Cannot approve fired employee timesheet' : 'Approve Timesheet')}
                                className="button button-success button-small"
                                onClick={(e) => handleApproveClick(e, employee.employeeId, employee.name)}
                                disabled={employee.approvalStatus !== 'Pending'}
                             >
                                <FaCheckCircle /> Approve
                             </button>
                             <button
                                title={isApprovedOrDenied ? `Timesheet already ${employee.approvalStatus.toLowerCase()}` : (isFired ? 'Cannot deny fired employee timesheet' : 'Deny Timesheet')}
                                className="button button-warning button-small"
                                onClick={(e) => handleDenyClick(e, employee.employeeId, employee.name)}
                                disabled={employee.approvalStatus !== 'Pending'}
                             >
                                <FaTimesCircle /> Deny
                             </button>
                         </div>

                        {/* Employee Action Menu */}
                        <div className="employee-action-menu-container action-menu-container">
                            <button
                                onClick={(e) => handleEmployeeMenuToggle(e, employee.employeeId)}
                                className="icon-button menu-dots-button">
                                <FaEllipsisV />
                            </button>
                            {isMenuOpen && (
                                <div className="action-menu">
                                    {employee.isActive ? (
                                        <button onClick={(e) => handleFireClick(e, employee.employeeId, employee.name)} className="danger">
                                            <FaTrashAlt /> Fire Employee
                                        </button>
                                    ) : (
                                        <button onClick={(e) => handleUndoFireClick(e, employee.employeeId, employee.name)} className="secondary">
                                            <FaUndo /> Undo Fire
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-employees-message">No employees found.</div>
        )}
      </div>
    </ManagerLayout>
  );
}

export default ManagerEmployees;