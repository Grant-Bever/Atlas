const clockService = require('../services/clockService');
const employeeTimesheetService = require('../services/employeeTimesheetService');
const payPeriodService = require('../services/payPeriodService');
const db = require('../models'); // Or however you access your models, e.g., const { Employee } = require('../models');

// Assumes auth middleware provides req.user.id or req.employee.id as employeeId

const getClockStatus = async (req, res, next) => {
  console.log('BACKEND: getClockStatus controller reached. Employee ID from auth:', req.user?.id);
  try {
    const employeeId = req.user.id; // Or req.employee.id depending on your auth setup
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request.' });
    }
    const status = await clockService.getClockStatus(employeeId);
    console.log('BACKEND: getClockStatus - Status fetched:', status);
    res.status(200).json(status);
  } catch (error) {
    console.error(`BACKEND: Error in getClockStatus for employee ${req.user?.id}:`, error);
    next(error);
  }
};

const clockIn = async (req, res, next) => {
  console.log('BACKEND: clockIn controller reached. Employee ID from auth:', req.user?.id);
  try {
    const employeeId = req.user.id;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request.' });
    }
    await clockService.clockIn(employeeId);
    console.log('BACKEND: clockIn - Clock-in processed by service.');
    const status = await clockService.getClockStatus(employeeId);
    console.log('BACKEND: clockIn - New status fetched:', status);
    res.status(200).json({ message: 'Clocked in successfully', status });
  } catch (error) {
    console.error(`BACKEND: Error in clockIn for employee ${req.user?.id}:`, error);
    next(error);
  }
};

const clockOut = async (req, res, next) => {
  console.log('BACKEND: clockOut controller reached. Employee ID from auth:', req.user?.id);
  try {
    const employeeId = req.user.id;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request.' });
    }
    await employeeTimesheetService.processClockOutData(employeeId);
    console.log('BACKEND: clockOut - Clock-out data processed by service.');
    const status = await clockService.getClockStatus(employeeId);
    console.log('BACKEND: clockOut - New status fetched:', status);
    res.status(200).json({ message: 'Clocked out successfully and timesheet updated', status });
  } catch (error) {
    console.error(`BACKEND: Error in clockOut for employee ${req.user?.id}:`, error);
    next(error);
  }
};

const getTimesheetEntries = async (req, res, next) => {
  console.log('BACKEND: getTimesheetEntries controller reached. Employee ID:', req.user?.id, 'Query:', req.query);
  try {
    const employeeId = req.user.id;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request.' });
    }

    let payPeriodId = req.query.payPeriodId;
    if (!payPeriodId) {
      console.log('BACKEND: getTimesheetEntries - No payPeriodId in query, fetching current.');
      const currentPayPeriod = await payPeriodService.getOrCreateCurrentPayPeriod();
      if (!currentPayPeriod) {
        console.log('BACKEND: getTimesheetEntries - Current pay period not found/created.');
        return res.status(404).json({ message: 'Current pay period not found and could not be created.' });
      }
      payPeriodId = currentPayPeriod.id;
      console.log('BACKEND: getTimesheetEntries - Using current payPeriodId:', payPeriodId);
    } else {
      console.log('BACKEND: getTimesheetEntries - Using provided payPeriodId:', payPeriodId);
      await payPeriodService.getPayPeriodById(payPeriodId); // Throws if not found
    }

    const entries = await employeeTimesheetService.getTimesheetEntriesForPayPeriod(employeeId, payPeriodId);
    console.log('BACKEND: getTimesheetEntries - Entries fetched, count:', entries.length);
    res.status(200).json({ payPeriodId, entries });
  } catch (error) {
    console.error(`BACKEND: Error in getTimesheetEntries for employee ${req.user?.id}:`, error);
    if (error.message === 'Pay period not found') {
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

const submitTimesheet = async (req, res, next) => {
  console.log('BACKEND: submitTimesheet controller reached. Employee ID:', req.user?.id, 'Body:', req.body);
  try {
    const employeeId = req.user.id;
    const { payPeriodId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found in request.' });
    }
    if (!payPeriodId) {
      return res.status(400).json({ message: 'Pay Period ID is required for submission.' });
    }
    console.log('BACKEND: submitTimesheet - Validating payPeriodId:', payPeriodId);
    await payPeriodService.getPayPeriodById(payPeriodId); 

    const result = await employeeTimesheetService.submitTimesheetForPayPeriod(employeeId, payPeriodId);
    console.log('BACKEND: submitTimesheet - Submission result:', result);
    res.status(200).json({ message: `Timesheet submitted successfully for pay period ${payPeriodId}. Submitted ${result.submittedCount} daily records.` });
  } catch (error) {
    console.error(`BACKEND: Error in submitTimesheet for employee ${req.user?.id}:`, error);
    if (error.message === 'Pay period not found') {
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  console.log('BACKEND: getMyProfile controller reached. Employee ID from auth:', req.user?.id); // <<<---- LOG (1)

  try {
    const employeeId = req.user.id;
    if (!employeeId) {
      console.log('BACKEND: getMyProfile - Employee ID not found in req.user. Sending 401.'); // <<<---- LOG (2)
      return res.status(401).json({ message: 'Authentication required, user ID not found.' });
    }

    console.log(`BACKEND: getMyProfile - Attempting to find Employee by Pk: ${employeeId}`); // <<<---- LOG (3)
    // Ensure db.Employee is the correct way to access your Employee model based on /models/index.js
    const employee = await db.Employee.findByPk(employeeId, {
      attributes: ['id', 'name', 'email', 'phone', 'hourly_rate']
    });
    console.log('BACKEND: getMyProfile - Employee.findByPk result:', employee ? `Found: ${JSON.stringify(employee.toJSON())}` : 'Not Found'); // <<<---- LOG (4)

    if (!employee) {
      console.log(`BACKEND: getMyProfile - Employee not found in DB for ID: ${employeeId}. Sending 404.`); // <<<---- LOG (5)
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    console.log(`BACKEND: getMyProfile - Employee found, sending profile data for ID: ${employeeId}`); // <<<---- LOG (6)
    res.status(200).json(employee);
    console.log(`BACKEND: getMyProfile - Response sent for ID: ${employeeId}`); // <<<---- LOG (7)

  } catch (error) {
    console.error(`BACKEND: ERROR in getMyProfile for employee ${req.user?.id}:`, error); // <<<---- LOG (8)
    next(error); // Pass to global error handler
  }
};

module.exports = {
  getClockStatus,
  clockIn,
  clockOut,
  getTimesheetEntries,
  submitTimesheet,
  getMyProfile
}; 