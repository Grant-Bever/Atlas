import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/FormPage.css'; // Shared form styles (create this)
import '../styles/Modal.css';  // Use existing modal styles

// --- Sample Data Fetching (Replace with actual API call) ---
const fetchEmployeeData = (employeeId) => {
  console.log("Fetching data for employee ID:", employeeId);
  // Simulate finding employee data
   const allEmployees = [
      { employeeId: 101, name: 'Alice Johnson', hourlyWage: 20.00, jobTitle: 'Lead Butcher', dateHired: '2023-01-15', phoneNumber: '555-123-4567', email: 'alice.j@example.com' },
      { employeeId: 102, name: 'Bob Smith', hourlyWage: 18.50, jobTitle: 'Cashier', dateHired: '2023-06-01', phoneNumber: '555-987-6543', email: 'bob.s@example.com' },
   ];
   const numericEmployeeId = parseInt(employeeId, 10);
   const foundEmployee = allEmployees.find(emp => emp.employeeId === numericEmployeeId);
   return foundEmployee ? Promise.resolve(foundEmployee) : Promise.resolve(null); 
};
// --- End Sample Data Fetching ---

function AddEmployee() {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Get employeeId from URL
  const isEditing = Boolean(employeeId);

  const [employeeName, setEmployeeName] = useState('');
  const [dateHired, setDateHired] = useState(new Date().toISOString().split('T')[0]);
  const [hourlyWage, setHourlyWage] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing); // Loading state for edit mode
  const [error, setError] = useState(null);

  // Fetch data if editing
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      fetchEmployeeData(employeeId)
        .then(data => {
          if (data) {
            setEmployeeName(data.name || '');
            setDateHired(data.dateHired || new Date().toISOString().split('T')[0]);
            setHourlyWage(data.hourlyWage !== undefined ? String(data.hourlyWage) : '');
            setJobTitle(data.jobTitle || '');
            setPhoneNumber(data.phoneNumber || '');
            setEmail(data.email || '');
          } else {
            setError('Employee not found.');
          }
        })
        .catch(err => {
           console.error("Error fetching employee data:", err);
           setError('Failed to load employee data.');
        })
        .finally(() => {
           setIsLoading(false);
        });
    }
  }, [employeeId, isEditing]);

  const handleAttemptSave = (e) => {
    e.preventDefault();
    if (isEditing) { 
        // Skip modal if just editing existing info
        handleConfirmSave();
    } else {
        // Show modal only when adding a new employee
        setIsModalOpen(true);
    } 
  };

  const handleConfirmSave = () => {
    const employeePayload = {
      employeeName,
      dateHired,
      hourlyWage: parseFloat(hourlyWage) || 0,
      jobTitle,
      phoneNumber,
      email
    };

    if (isEditing) {
      console.log(`UPDATING Employee ${employeeId}:`, employeePayload);
      // TODO: API call to update employeeId
    } else {
      console.log("SAVING New Employee:", employeePayload);
      // TODO: API call to create new employee
      // TODO: Send welcome/setup email to employee
      console.log(`Sending setup email to ${email}`);
    }

    setIsModalOpen(false); // Close modal if it was open
    navigate('/employees'); 
  };

  const handleCancelSave = () => {
    setIsModalOpen(false);
  };

  const handleCancelForm = () => {
    navigate('/employees');
  };

  // --- Render Logic ---
   if (isLoading && isEditing) { // Show loading only when editing
      return <ManagerLayout><div>Loading employee data...</div></ManagerLayout>;
   }

   if (error) {
        return <ManagerLayout><div style={{ color: 'red', padding: '20px' }}>Error: {error}</div></ManagerLayout>;
   }

  return (
    // Update page title dynamically
    <ManagerLayout pageTitle={isEditing ? `Edit Employee: ${employeeName || employeeId}` : 'Add New Employee'}> 
      <div className="form-page-container">
        <form onSubmit={handleAttemptSave}>
          <div className="form-page-header">
             {/* Update form title dynamically */}
            <h2>{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h2> 
            <div className="form-page-actions">
              <button type="button" onClick={handleCancelForm} className="button button-secondary">Cancel</button>
              <button type="submit" className="button button-primary">{isEditing ? 'Update Employee' : 'Save Employee'}</button>
            </div>
          </div>

          {/* Form Fields (values are bound to state) */}
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="employeeName">Employee Name</label>
              <input type="text" id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="dateHired">Date Hired</label>
              <input type="date" id="dateHired" value={dateHired} onChange={(e) => setDateHired(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="hourlyWage">Hourly Wage ($)</label>
              <input type="number" step="0.01" id="hourlyWage" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} required placeholder="e.g., 18.50" />
            </div>
            <div className="form-field">
              <label htmlFor="jobTitle">Job Title</label>
              <input type="text" id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
             <div className="form-field">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="(Optional)"/>
            </div>
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              {/* Disable email editing for existing employees? Optional */}
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Used for account setup" disabled={isEditing} />
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal (only shown when adding new) */}
      {!isEditing && isModalOpen && ( 
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirm Employee Addition</h4>
            <p>Adding this employee will send them an email inviting them to create an account to manage their timesheets. Do you want to proceed?</p>
            <div className="modal-actions">
              <button onClick={handleCancelSave} className="button button-secondary">Cancel</button>
              <button onClick={handleConfirmSave} className="button button-primary">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

export default AddEmployee; 