const express = require('express');
const employeeController = require('../controllers/employeeController');
// const authMiddleware = require('../middleware/authMiddleware'); // Optional: Add auth later

const router = express.Router();

// Optional: Apply authentication middleware to all employee routes
// router.use(authMiddleware);

// --- Timesheet Routes --- 

// GET /api/employees/timesheets/weekly - Fetch processed weekly timesheets for all relevant employees
router.get('/timesheets/weekly', employeeController.getWeeklyTimesheets);

// PATCH /api/employees/:employeeId/timesheets/weekly/approve - Approve a specific employee's timesheet for the current week
router.patch('/:employeeId/timesheets/weekly/approve', employeeController.approveWeeklyTimesheet);

// PATCH /api/employees/:employeeId/timesheets/weekly/deny - Deny a specific employee's timesheet for the current week
router.patch('/:employeeId/timesheets/weekly/deny', employeeController.denyWeeklyTimesheet);

// --- Employee Status Routes ---

// PATCH /api/employees/:employeeId/fire - Mark an employee as inactive
router.patch('/:employeeId/fire', employeeController.fireEmployee);

// PATCH /api/employees/:employeeId/reinstate - Mark an employee as active
router.patch('/:employeeId/reinstate', employeeController.reinstateEmployee);

// --- Add other employee-related routes here (e.g., CRUD for employees) ---

// POST /api/employees - Add a new employee
router.post('/', employeeController.addEmployee);

// GET /api/employees/:employeeId - Get specific employee details
// PUT /api/employees/:employeeId - Update employee details
// DELETE /api/employees/:employeeId - Fire/delete employee (potentially just update status)

module.exports = router; 