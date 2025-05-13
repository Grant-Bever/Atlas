const express = require('express');
const router = express.Router();
const employeeTimesheetController = require('../controllers/employeeTimesheetController');
const payPeriodController = require('../controllers/payPeriodController');
const jwt = require('jsonwebtoken'); // Make sure jwt is installed

// Improved middleware for authenticating an employee
const authenticateEmployee = (req, res, next) => {
  console.log('AUTH: Employee authentication middleware invoked');
  
  // Extract the token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('AUTH: No Bearer token in Authorization header');
    return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atlas-dev-secret');
    console.log('AUTH: JWT token decoded successfully', { 
      employeeId: decoded.userId,
      role: decoded.role
    });
    
    // Ensure it's an employee token
    if (decoded.role !== 'employee') {
      console.warn('AUTH: Token is not for an employee role', { role: decoded.role });
      return res.status(403).json({ message: 'Forbidden: Employee access required' });
    }
    
    // Set user info on request object
    req.user = { 
      id: decoded.userId,
      role: decoded.role
    };
    
    console.log('AUTH: Employee authenticated successfully', { employeeId: req.user.id });
    next();
  } catch (error) {
    console.error('AUTH: JWT verification error', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// --- Employee Self-Service Timesheet Routes ---

// Profile
router.get('/me/profile', authenticateEmployee, employeeTimesheetController.getMyProfile);

// Clock Status
router.get('/me/clock-status', authenticateEmployee, employeeTimesheetController.getClockStatus);

// Timesheet Status
router.get('/me/timesheet-status', authenticateEmployee, employeeTimesheetController.getTimesheetStatus);

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