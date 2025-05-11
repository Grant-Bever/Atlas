const express = require('express');
const router = express.Router();
const employeeTimesheetController = require('../controllers/employeeTimesheetController');
const payPeriodController = require('../controllers/payPeriodController');

// Presumed middleware for authenticating an employee and attaching user info to req (e.g., req.user.id)
// Replace 'authenticateEmployee' with your actual authentication middleware for employees
const authenticateEmployee = (req, res, next) => {
  // Placeholder: In a real app, this would verify JWT, session, etc.
  // and set req.user (or req.employee) with authenticated employee details including id.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer employeeToken')) { // Example check
    req.user = { id: 1 }; // Example: Hardcoding employee ID 1 for testing. REPLACE THIS.
    return next();
  }
  // return res.status(401).json({ message: 'Unauthorized: Employee access required.' });
  // For now, let's assume for testing, we can proceed if no auth for local dev
  // but in production this must be secured.
  if (!req.user) {
      console.warn('Bypassing employee authentication for route. Ensure this is safe for your environment or add real auth.');
      req.user = { id: 1 }; // Default to employee 1 if no auth, for dev purposes ONLY.
  }
  next();
};

// --- Employee Self-Service Timesheet Routes ---

// Profile
router.get('/me/profile', authenticateEmployee, employeeTimesheetController.getMyProfile);

// Clock Status
router.get('/me/clock-status', authenticateEmployee, employeeTimesheetController.getClockStatus);

// Clock In
router.post('/me/clock-in', authenticateEmployee, employeeTimesheetController.clockIn);

// Clock Out
router.post('/me/clock-out', authenticateEmployee, employeeTimesheetController.clockOut);

// --- Pay Period Routes ---
// Gets the current pay period, creating it if it doesn't exist.
router.get('/me/pay-period/current', authenticateEmployee, payPeriodController.getCurrentPayPeriod);

// --- Timesheet Entry Routes ---
// Get timesheet entries for an employee. Defaults to current pay period if payPeriodId is not specified.
router.get('/me/timesheet-entries', authenticateEmployee, employeeTimesheetController.getTimesheetEntries);

// Submit timesheet for a specific pay period
router.post('/me/timesheet/submit', authenticateEmployee, employeeTimesheetController.submitTimesheet);

module.exports = router; 