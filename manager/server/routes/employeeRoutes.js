const express = require('express');
const employeeController = require('../controllers/employeeController');
// const authMiddleware = require('../middleware/authMiddleware'); // Optional: Add auth later
const db = require('../models'); // Import the whole db object
const { Employee, ClockEvent, TimesheetEntry, WeeklyTimesheetStatus } = db; // Destructure models from db
const { Op } = require('sequelize');
const { authenticateEmployee, isManager } = require('../middleware/auth');

// Helper function to check if two date objects are the same calendar day
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  // Ensure we are comparing Date objects
  const d1 = (date1 instanceof Date) ? date1 : new Date(date1);
  const d2 = (date2 instanceof Date) ? date2 : new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false; // Invalid date check

  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Helper function to calculate start/end of current week (copied from employeeService for now)
const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const diffToSunday = currentDay === 0 ? 0 : 7 - currentDay;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0); // Start of Monday

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + diffToSunday);
    endDate.setHours(23, 59, 59, 999); // End of Sunday

    // Get Monday's date in YYYY-MM-DD format for status lookup
    const weekStartDateOnly = startDate.toISOString().split('T')[0];

    return { startDate, endDate, weekStartDateOnly };
};

const router = express.Router();

// Optional: Apply authentication middleware to all employee routes
// router.use(authMiddleware);

// --- Timesheet Routes --- 

// GET /api/employees/timesheets/weekly - Fetch processed weekly timesheets for relevant employees (manager view)
// Protected by authenticateEmployee to get req.employee, and isManager to ensure it's a manager.
router.get('/timesheets/weekly', authenticateEmployee, isManager, employeeController.getWeeklyTimesheets);

// PATCH /api/employees/:employeeId/timesheets/weekly/approve - Approve a specific employee's timesheet for the current week
// Should also be protected if only managers can approve.
router.patch('/:employeeId/timesheets/weekly/approve', authenticateEmployee, isManager, employeeController.approveWeeklyTimesheet);

// PATCH /api/employees/:employeeId/timesheets/weekly/deny - Deny a specific employee's timesheet for the current week
// Should also be protected if only managers can deny.
router.patch('/:employeeId/timesheets/weekly/deny', authenticateEmployee, isManager, employeeController.denyWeeklyTimesheet);

// --- Employee Status Routes ---

// PATCH /api/employees/:employeeId/fire - Mark an employee as inactive
// Should also be protected if only managers can fire.
router.patch('/:employeeId/fire', authenticateEmployee, isManager, employeeController.fireEmployee);

// PATCH /api/employees/:employeeId/reinstate - Mark an employee as active
// Should also be protected if only managers can reinstate.
router.patch('/:employeeId/reinstate', authenticateEmployee, isManager, employeeController.reinstateEmployee);

// --- Add other employee-related routes here (e.g., CRUD for employees) ---

// POST /api/employees - Add a new employee
// Should also be protected if only managers can add employees.
router.post('/', authenticateEmployee, isManager, employeeController.addEmployee);

// GET /api/employees/:employeeId - Get specific employee details
// PUT /api/employees/:employeeId - Update employee details
// DELETE /api/employees/:employeeId - Fire/delete employee (potentially just update status)

// Clock In
// router.post('/clock-in', authenticateEmployee, async (req, res) => {
router.post('/clock-in', /* authenticateEmployee, */ async (req, res) => { // Temporarily remove auth
  try {
    // const employeeId = req.employee.id; // Requires auth
    const employeeId = 1; // TEMPORARY: Use a fixed ID for testing without auth
    
    // Fetch the last event to check status and date
    const lastEvent = await ClockEvent.findOne({
      where: { employeeId },
      order: [['timestamp', 'DESC']]
    });

    const now = new Date();

    // Check 1: Already clocked out today?
    if (lastEvent && lastEvent.eventType === 'CLOCK_OUT' && isSameDay(lastEvent.timestamp, now)) {
      return res.status(400).json({ message: 'Already clocked out for the day. Cannot clock in again until tomorrow.' });
    }

    // Check 2: Already clocked in? (Original check)
    if (lastEvent && lastEvent.eventType === 'CLOCK_IN') {
      return res.status(400).json({ message: 'Already clocked in.' }); // Keep original message
    }

    // Proceed to clock in
    const clockEvent = await ClockEvent.create({
      employeeId,
      eventType: 'CLOCK_IN',
      timestamp: now // Ensure we use the current timestamp
    });

    res.status(201).json(clockEvent);
  } catch (error) {
    console.error("Clock In Error:", error); // Log the actual error
    res.status(500).json({ message: 'Error clocking in', error: error.message });
  }
});

// Clock Out
// router.post('/clock-out', authenticateEmployee, async (req, res) => {
router.post('/clock-out', /* authenticateEmployee, */ async (req, res) => { // Temporarily remove auth
  try {
    // const employeeId = req.employee.id; // Requires auth
    const employeeId = 1; // TEMPORARY: Use a fixed ID for testing without auth
    
    // Check if already clocked out
    const lastEvent = await ClockEvent.findOne({
      where: { employeeId },
      order: [['timestamp', 'DESC']]
    });

    if (!lastEvent || lastEvent.eventType === 'CLOCK_OUT') {
      return res.status(400).json({ message: 'Not currently clocked in' });
    }

    const clockEvent = await ClockEvent.create({
      employeeId,
      eventType: 'CLOCK_OUT'
    });

    res.status(201).json(clockEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error clocking out', error: error.message });
  }
});

// Get Current Status
// router.get('/clock-status', authenticateEmployee, async (req, res) => {
router.get('/clock-status', /* authenticateEmployee, */ async (req, res) => { // Temporarily remove auth
  try {
    // const employeeId = req.employee.id; // Requires auth
    const employeeId = 1; // TEMPORARY: Use a fixed ID for testing without auth
    const lastEvent = await ClockEvent.findOne({
      where: { employeeId },
      order: [['timestamp', 'DESC']]
    });

    const status = {
      isClockedIn: lastEvent?.eventType === 'CLOCK_IN',
      lastEvent: lastEvent
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status', error: error.message });
  }
});

// Get Clock History
// router.get('/clock-history', authenticateEmployee, async (req, res) => {
router.get('/clock-history', /* authenticateEmployee, */ async (req, res) => { // Temporarily remove auth for testing
  try {
    // const employeeId = req.employee.id; // Requires auth
    const employeeId = 1; // TEMPORARY: Use a fixed ID for testing without auth
    const history = await ClockEvent.findAll({
      where: { employeeId },
      order: [['timestamp', 'DESC']],
      limit: 50 // Limit to recent events
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

// --- NEW: Submit Timesheet Route --- 
// POST /api/employees/timesheet/submit 
router.post('/timesheet/submit', /* authenticateEmployee, */ async (req, res) => {
  // Temporarily bypassing auth and using fixed employee ID
  const employeeId = 1; 
  const { startDate, endDate, weekStartDateOnly } = getCurrentWeekDates();
  
  console.log(`Processing timesheet submission for employee ${employeeId}, week starting ${weekStartDateOnly}`);

  // Use a transaction to ensure atomicity
  const transaction = await db.sequelize.transaction();

  try {
    // 1. Fetch Clock Events for the week
    const clockEvents = await ClockEvent.findAll({
      where: {
        employeeId: employeeId,
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['timestamp', 'ASC']],
      transaction // Include transaction
    });

    console.log(`Found ${clockEvents.length} clock events for the period.`);

    // 2. Clear existing Timesheet Entries for this week to avoid duplicates
    await TimesheetEntry.destroy({
        where: {
            employee_id: employeeId,
            // Check against clockInTime as clockOutTime might be null initially
            clockInTime: { 
                [Op.between]: [startDate, endDate]
            }
        },
        transaction // Include transaction
    });
    console.log(`Cleared existing timesheet entries for employee ${employeeId}, week ${weekStartDateOnly}.`);

    // 3. Process Clock Events and Create Timesheet Entries
    const timesheetEntriesToCreate = [];
    for (let i = 0; i < clockEvents.length; i++) {
      const event = clockEvents[i];
      if (event.eventType === 'CLOCK_IN') {
        // Find the next CLOCK_OUT event *after* this CLOCK_IN
        const nextClockOut = clockEvents.find((nextEvent, index) => 
            index > i && nextEvent.eventType === 'CLOCK_OUT'
        );

        if (nextClockOut) {
          timesheetEntriesToCreate.push({
            employee_id: employeeId,
            clockInTime: event.timestamp,
            clockOutTime: nextClockOut.timestamp 
          });
          // Skip the matched CLOCK_OUT event in the next iteration
          // A simple way is to advance 'i', but find provides cleaner pairing search
          // More robust pairing might be needed for complex scenarios (missed punches)
          console.log(`Paired IN at ${event.timestamp} with OUT at ${nextClockOut.timestamp}`);
        } else {
           console.log(`Found CLOCK_IN at ${event.timestamp} with no matching CLOCK_OUT.`);
           // Decide how to handle unmatched clock-ins if necessary
        }
      }
      // Ignore CLOCK_OUT events that weren't preceded by a CLOCK_IN in this loop's logic
    }

    if (timesheetEntriesToCreate.length > 0) {
        await TimesheetEntry.bulkCreate(timesheetEntriesToCreate, { transaction }); // Include transaction
        console.log(`Created ${timesheetEntriesToCreate.length} new timesheet entries.`);
    } else {
        console.log("No valid clock-in/out pairs found to create timesheet entries.");
    }

    // 4. Create or Update Weekly Timesheet Status to 'Pending'
    const [statusRecord, created] = await WeeklyTimesheetStatus.findOrCreate({
      where: {
        employee_id: employeeId,
        weekStartDate: weekStartDateOnly
      },
      defaults: {
        status: 'Pending' 
      },
      transaction // Include transaction
    });

    // If the record existed and wasn't 'Pending', update it
    if (!created && statusRecord.status !== 'Pending') {
      statusRecord.status = 'Pending';
      await statusRecord.save({ transaction }); // Include transaction
      console.log(`Updated existing weekly status to 'Pending' for employee ${employeeId}, week ${weekStartDateOnly}.`);
    } else if (created) {
       console.log(`Created new weekly status as 'Pending' for employee ${employeeId}, week ${weekStartDateOnly}.`);
    } else {
       console.log(`Weekly status was already 'Pending' for employee ${employeeId}, week ${weekStartDateOnly}.`);
    }

    // If everything succeeded, commit the transaction
    await transaction.commit();
    console.log(`Timesheet submission transaction committed successfully for employee ${employeeId}.`);
    res.json({ message: 'Timesheet processed and submitted successfully.' });

  } catch (error) { // Make sure this catch block exists
    // If any step failed, roll back the transaction
    await transaction.rollback();
    console.error('Error processing timesheet submission:', error);
    res.status(500).json({ message: 'Error processing timesheet submission', error: error.message });
  }
});

module.exports = router; // Make sure this line exists