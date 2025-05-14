import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/FormPage.css'; // Shared form styles
import '../styles/Modal.css';  // Use existing modal styles
import { API_BASE_URL } from '../utils/config';

// Base URL for the API
const API_ENDPOINT = `${API_BASE_URL}/api`;

// --- REMOVED Sample Data Fetching ---
// const fetchEmployeeData = (employeeId) => { ... }; // REMOVED

function AddEmployee() {
  const history = useHistory();
  const { employeeId } = useParams(); // Get employeeId from URL
  const isEditing = Boolean(employeeId);

  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [dateHired, setDateHired] = useState(new Date().toISOString().split('T')[0]); // Keep dateHired for now, though not in DB schema shown
  const [hourlyWage, setHourlyWage] = useState('');
  const [jobTitle, setJobTitle] = useState(''); // Keep jobTitle for now
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Component State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing); // Loading state for edit mode
  const [error, setError] = useState(null); // For general/fetch errors
  const [submitError, setSubmitError] = useState(null); // For submission errors

  // Fetch data if editing
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      setError(null); // Clear previous errors
      fetch(`${API_ENDPOINT}/employees/${employeeId}`) // Use actual endpoint
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('Employee not found.');
            }
            // Try to parse error message from backend
            return res.json().then(errData => {
                 throw new Error(errData.message || 'Failed to fetch employee data.');
            }).catch(() => { // Fallback if error parsing fails
                 throw new Error('Failed to fetch employee data.');
            });
          }
          return res.json();
        })
        .then(data => {
          // Map backend fields (name, email, phone, hourly_rate) to frontend state
          setEmployeeName(data.name || '');
          setEmail(data.email || '');
          setPhoneNumber(data.phone || ''); // Map phone to phoneNumber
          setHourlyWage(data.hourly_rate !== undefined ? String(data.hourly_rate) : ''); // Map hourly_rate to hourlyWage
          // Keep jobTitle and dateHired populated if they exist in data, though they might not be in the schema
          setJobTitle(data.jobTitle || ''); // Assuming jobTitle might exist for editing display
          setDateHired(data.dateHired || new Date().toISOString().split('T')[0]); // Assuming dateHired might exist
        })
        .catch(err => {
           console.error("Error fetching employee data:", err);
           setError(err.message || 'Failed to load employee data.');
        })
        .finally(() => {
           setIsLoading(false);
        });
    }
  }, [employeeId, isEditing]); // Dependencies

  const handleAttemptSave = (e) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous submit errors
    if (isEditing) {
        // Skip modal if just editing existing info
        handleConfirmSave();
    } else {
        // Show modal only when adding a new employee
        setIsModalOpen(true);
    }
  };

  // --- API Call Logic ---
  const handleConfirmSave = async () => {
    setIsModalOpen(false); // Close modal immediately

    // Map frontend state to backend expected fields
    const employeePayload = {
      name: employeeName,
      email: email,
      phone: phoneNumber || null, // Send null if empty
      hourly_rate: parseFloat(hourlyWage) || 0,
      // --- Fields not directly in DB schema shown but present in form ---
      // Add these ONLY if your backend API endpoint actually expects them
      // jobTitle: jobTitle,
      // dateHired: dateHired,
      // --- End optional fields ---

      // Add password field only when creating (assuming backend handles this)
      // The actual password should ideally be set via the email link/setup process
      // Or the backend should generate one if not provided
    };
    if (!isEditing) {
        // A placeholder or mechanism to indicate password setup is needed
        // Avoid sending plain text passwords if possible
        // employeePayload.password = 'initiate_setup'; // Example indicator
    }


    const url = isEditing ? `${API_ENDPOINT}/employees/${employeeId}` : `${API_ENDPOINT}/employees`;
    const method = isEditing ? 'PUT' : 'POST';

    console.log(`Attempting ${method} request to ${url}`); // Debug log start

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeePayload),
        });

        if (!response.ok) {
            // Try to get more specific error message from backend response body
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            console.error('API Error Response Data:', errorData);
            throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} employee.`);
        }

        // --- Success ---
        const responseData = await response.json(); // Get response data (e.g., the created/updated employee)
        console.log(`Employee ${isEditing ? 'updated' : 'added'} successfully:`, responseData);

        // TODO: Potentially trigger welcome/setup email (backend might do this automatically)
        if (!isEditing) {
          console.log(`Setup process for ${email} should be initiated.`);
        }
        history.push('/employees'); // Changed navigate

    } catch (err) {
        console.error(`Error saving employee (${method} ${url}):`, err);
        setSubmitError(err.message || 'An unexpected error occurred while saving.'); // Display submit error
    }
  };
  // --- End API Call Logic ---


  const handleCancelSave = () => {
    setIsModalOpen(false);
  };

  const handleCancelForm = () => {
    history.push('/employees'); // Changed navigate
  };

  // --- Render Logic ---
   if (isLoading && isEditing) {
      return <ManagerLayout><div>Loading employee data...</div></ManagerLayout>;
   }

   if (error) { // Display fetch error
        return <ManagerLayout><div className="form-error-message">Error loading employee data: {error}</div></ManagerLayout>;
   }

  return (
    <ManagerLayout pageTitle={isEditing ? `Edit Employee: ${employeeName || employeeId}` : 'Add New Employee'}>
      <div className="form-page-container">
        <form onSubmit={handleAttemptSave}>
          <div className="form-page-header">
            <h2>{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h2>
            <div className="form-page-actions">
              <button type="button" onClick={handleCancelForm} className="button button-secondary">Cancel</button>
              <button type="submit" className="button button-primary">{isEditing ? 'Update Employee' : 'Save Employee'}</button>
            </div>
          </div>

           {/* Display submission errors */}
           {submitError && (
             <div className="form-error-message" style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
               Save Error: {submitError}
             </div>
           )}


          {/* Form Fields */}
          <div className="form-grid">
             <div className="form-field">
              <label htmlFor="employeeName">Employee Name</label>
              <input type="text" id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
            </div>
             {/* Date Hired - Keep UI element for now, but may not map directly to DB */}
            <div className="form-field">
              <label htmlFor="dateHired">Date Hired</label>
              <input type="date" id="dateHired" value={dateHired} onChange={(e) => setDateHired(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="hourlyWage">Hourly Rate ($)</label> {/* Changed label slightly */}
              <input type="number" step="0.01" id="hourlyWage" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} required placeholder="e.g., 18.50" />
            </div>
             {/* Job Title - Keep UI element for now */}
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
              {/* Email is often used as an identifier, disable editing */}
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
            <p>Proceed with adding this employee? They may need to set up their account via email.</p> {/* Updated text */}
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