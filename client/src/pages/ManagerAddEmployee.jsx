import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/FormPage.css'; // Shared form styles (create this)
import '../styles/Modal.css';  // Use existing modal styles

function AddEmployee() {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState('');
  const [dateHired, setDateHired] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [hourlyWage, setHourlyWage] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAttemptSave = (e) => {
    e.preventDefault(); // Prevent default form submission
    // TODO: Add form validation here if needed
    setIsModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmSave = () => {
    // TODO: Implement actual API call to save employee data
    console.log("Saving Employee Data:", {
      employeeName,
      dateHired,
      hourlyWage,
      jobTitle,
      phoneNumber,
      email
    });
    setIsModalOpen(false);
    // TODO: Send welcome/setup email to employee
    console.log(`Sending setup email to ${email}`);
    navigate('/employees'); // Navigate back to employees list
  };

  const handleCancelSave = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleCancelForm = () => {
    navigate('/employees'); // Navigate back without saving
  };

  return (
    <ManagerLayout pageTitle="New Employee">
      <div className="form-page-container">
        <form onSubmit={handleAttemptSave}>
          <div className="form-page-header">
            <h2>Add New Employee</h2>
            <div className="form-page-actions">
              <button type="button" onClick={handleCancelForm} className="button button-secondary">Cancel</button>
              <button type="submit" className="button button-primary">Save Employee</button>
            </div>
          </div>

          {/* Form Fields */}
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
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Used for account setup"/>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
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