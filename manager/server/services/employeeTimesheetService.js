const { Timesheet, Employee, ClockEvent, PayPeriod, WeeklyTimesheetStatus } = require('../models');
const payPeriodService = require('./payPeriodService');
const clockService = require('./clockService');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

// This function is now more of an orchestrator for clock-out related data processing
const processClockOutData = async (employeeId) => {
  console.log(`SERVICE: processClockOutData called for employeeId: ${employeeId}`);
  const employee = await Employee.findByPk(employeeId);
  if (!employee || !employee.hourly_rate) {
    console.error(`SERVICE: processClockOutData - Employee ${employeeId} not found or hourly rate not set.`);
    throw new Error('Employee not found or hourly rate not set.');
  }
  console.log(`SERVICE: processClockOutData - Employee hourly rate: ${employee.hourly_rate}`);

  // clockService.clockOut now returns the pair of events or throws an error
  const { clockInEvent, clockOutEvent } = await clockService.clockOut(employeeId);
  console.log(`SERVICE: processClockOutData - ClockIn Event ID: ${clockInEvent.id}, Timestamp: ${clockInEvent.timestamp}`);
  console.log(`SERVICE: processClockOutData - ClockOut Event ID: ${clockOutEvent.id}, Timestamp: ${clockOutEvent.timestamp}`);

  const clockInTime = moment(clockInEvent.timestamp);
  const clockOutTime = moment(clockOutEvent.timestamp);

  if (clockOutTime.isBefore(clockInTime)) {
    console.error('SERVICE: processClockOutData - Clock out time is before clock in time.');
    // Should ideally be caught by clockService, but as a safeguard:
    throw new Error('Clock out time cannot be before clock in time.');
  }

  const durationMs = clockOutTime.diff(clockInTime);
  const durationHours = durationMs / (1000 * 60 * 60);
  console.log(`SERVICE: processClockOutData - Calculated duration: ${durationHours.toFixed(2)} hours.`);
  
  // Ensure duration is reasonable (e.g., not negative if timestamps were problematic)
  if (durationHours < 0) {
      console.error('SERVICE: processClockOutData - Calculated negative duration for employee', employeeId);
      throw new Error('Calculated negative work duration. Check event timestamps.');
  }

  // const dailyPay = parseFloat((durationHours * parseFloat(employee.hourly_rate)).toFixed(2)); // Not stored on Timesheet model currently
  const workDate = clockInTime.tz('America/New_York').format('YYYY-MM-DD');
  console.log(`SERVICE: processClockOutData - Determined workDate: ${workDate}`);

  const currentPayPeriod = await payPeriodService.getOrCreateCurrentPayPeriod();
  if (!currentPayPeriod) {
    console.error('SERVICE: processClockOutData - Could not determine current pay period.');
    throw new Error('Could not determine current pay period.');
  }
  console.log(`SERVICE: processClockOutData - Using PayPeriod ID: ${currentPayPeriod.id}, Start: ${currentPayPeriod.startDate}, End: ${currentPayPeriod.endDate}`);

  // Find or create the daily Timesheet record for this employee, date, and pay period
  let dailyTimesheetEntry = await Timesheet.findOne({
    where: {
      employeeId: employeeId,
      date: workDate,
      payPeriodId: currentPayPeriod.id,
    },
  });

  if (dailyTimesheetEntry) {
    console.log(`SERVICE: processClockOutData - Found existing daily Timesheet record ID: ${dailyTimesheetEntry.id} for date: ${workDate}. Current hours: ${dailyTimesheetEntry.hoursWorked}`);
    // If entry exists, accumulate hours and pay
    const newHoursWorked = parseFloat((parseFloat(dailyTimesheetEntry.hoursWorked) + durationHours).toFixed(3));
    dailyTimesheetEntry.hoursWorked = newHoursWorked;
    console.log(`SERVICE: processClockOutData - Updating existing daily Timesheet. New total hoursWorked: ${newHoursWorked}`);
    await dailyTimesheetEntry.save();
    console.log(`SERVICE: processClockOutData - Existing daily Timesheet ID: ${dailyTimesheetEntry.id} saved.`);
  } else {
    console.log(`SERVICE: processClockOutData - No existing daily Timesheet record for date: ${workDate}. Creating new one.`);
    const newHoursWorked = parseFloat(durationHours.toFixed(3));
    dailyTimesheetEntry = await Timesheet.create({
      employeeId: employeeId,
      payPeriodId: currentPayPeriod.id,
      date: workDate,
      hoursWorked: newHoursWorked,
      // dailyPay: dailyPay, // The schema for `Timesheet` model from `timesheet.js` doesn't have `dailyPay` field. It has `hoursWorked`.
      // For now, let's assume `Timesheet` `hoursWorked` is total for the day, and we might need to re-calculate total daily pay if multiple clock-ins.
      // For simplicity in this step, let's assume one clock-in/out pair creates/updates one daily record. Revisit if multiple pairs per day.
      status: 'draft', // Default for new entries
    });
    console.log(`SERVICE: processClockOutData - Created new daily Timesheet record ID: ${dailyTimesheetEntry.id} with hoursWorked: ${newHoursWorked}`);
  }
  return dailyTimesheetEntry;
};

const getTimesheetEntriesForPayPeriod = async (employeeId, payPeriodId) => {
  if (!employeeId || !payPeriodId) {
    throw new Error('Employee ID and Pay Period ID are required.');
  }
  const entries = await Timesheet.findAll({
    where: {
      employeeId: employeeId,
      payPeriodId: payPeriodId,
    },
    order: [['date', 'ASC']],
    // include: [{ model: PayPeriod, as: 'payPeriod' }] // Optional if you need pay period details with each entry
  });
  return entries;
};

const submitTimesheetForPayPeriod = async (employeeId, payPeriodId) => {
  console.log('DEBUG: submitTimesheetForPayPeriod called with:', { employeeId, payPeriodId });
  
  if (!employeeId || !payPeriodId) {
    throw new Error('Employee ID and Pay Period ID are required.');
  }

  // 1. Update all Timesheet entries to 'submitted' for this pay period
  console.log('DEBUG: Updating Timesheet entries to submitted status');
  const [numberOfAffectedRows, affectedRows] = await Timesheet.update(
    { status: 'submitted' },
    {
      where: {
        employeeId: employeeId,
        payPeriodId: payPeriodId
      },
      returning: true
    }
  );
  console.log('DEBUG: Updated timesheet entries count:', numberOfAffectedRows);

  if (numberOfAffectedRows > 0) {
    // 2. Fetch the pay period to get its start date
    console.log('DEBUG: Fetching pay period details');
    const payPeriod = await payPeriodService.getPayPeriodById(payPeriodId);
    console.log('DEBUG: Pay period details:', {
      id: payPeriodId,
      startDate: payPeriod?.startDate,
      endDate: payPeriod?.endDate,
      status: payPeriod?.status
    });

    if (!payPeriod || !payPeriod.startDate) {
      console.error(`SERVICE: submitTimesheetForPayPeriod - PayPeriod ${payPeriodId} not found or has no startDate.`);
      throw new Error('Pay period not found or invalid');
    }

    // Calculate the week start date (Saturday)
    const payPeriodStartMoment = moment(payPeriod.startDate).tz('America/New_York');
    // Use the pay period start date directly since it's already aligned with the week start
    const effectiveWeekStartDate = payPeriodStartMoment.format('YYYY-MM-DD');
    
    console.log('DEBUG: Date calculations:', {
      payPeriodStart: payPeriod.startDate,
      payPeriodStartAsMoment: payPeriodStartMoment.format(),
      effectiveWeekStartDate,
      currentTime: moment().tz('America/New_York').format()
    });

    try {
      // Create or update the WeeklyTimesheetStatus record
      const [statusRecord, created] = await WeeklyTimesheetStatus.upsert({
        employeeId: employeeId,
        weekStartDate: effectiveWeekStartDate,
        status: 'Pending'
      }, {
        returning: true
      });

      console.log('DEBUG: WeeklyTimesheetStatus record:', {
        record: statusRecord.get({ plain: true }),
        wasCreated: created
      });

      // Verify the record exists and has the correct status
      const verifyStatus = await WeeklyTimesheetStatus.findOne({
        where: {
          employeeId: employeeId,
          weekStartDate: effectiveWeekStartDate
        }
      });
      
      if (!verifyStatus || verifyStatus.status !== 'Pending') {
        throw new Error('Failed to create/verify WeeklyTimesheetStatus record with correct status');
      }
      
      console.log('DEBUG: Verified WeeklyTimesheetStatus record exists:', verifyStatus.get({ plain: true }));
    } catch (error) {
      console.error('ERROR: Failed to create/update WeeklyTimesheetStatus:', error);
      throw new Error('Failed to update timesheet status');
    }
  }

  return { submittedCount: numberOfAffectedRows };
};


module.exports = {
  processClockOutData,
  getTimesheetEntriesForPayPeriod,
  submitTimesheetForPayPeriod,
}; 