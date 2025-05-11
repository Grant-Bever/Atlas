const { ClockEvent, Employee } = require('../models');
const { Op } = require('sequelize');

const clockIn = async (employeeId) => {
  if (!employeeId) {
    throw new Error('Employee ID is required to clock in.');
  }

  // Optional: Check if already clocked in to prevent double clock-ins
  const lastEvent = await ClockEvent.findOne({
    where: { employeeId },
    order: [['timestamp', 'DESC']],
  });

  if (lastEvent && lastEvent.eventType === 'CLOCK_IN') {
    // Already clocked in, return current status or throw error
    // For now, let's allow it but ideally, this should be handled by UI or stricter logic
    console.warn(`Employee ${employeeId} is already clocked in. Proceeding with new clock-in.`);
    // throw new Error('Employee is already clocked in.');
  }

  const clockInEvent = await ClockEvent.create({
    employeeId,
    eventType: 'CLOCK_IN',
    timestamp: new Date(),
  });
  return clockInEvent;
};

const clockOut = async (employeeId) => {
  if (!employeeId) {
    throw new Error('Employee ID is required to clock out.');
  }

  const lastClockInEvent = await ClockEvent.findOne({
    where: {
      employeeId,
      eventType: 'CLOCK_IN',
    },
    order: [['timestamp', 'DESC']],
  });

  if (!lastClockInEvent) {
    throw new Error('No active clock-in found for this employee to clock out.');
  }
  
  // Check if there's a CLOCK_OUT event that occurred after the last CLOCK_IN
  const subsequentClockOut = await ClockEvent.findOne({
    where: {
        employeeId,
        eventType: 'CLOCK_OUT',
        timestamp: { [Op.gt]: lastClockInEvent.timestamp }
    }
  });

  if (subsequentClockOut) {
    // This means the last CLOCK_IN was already paired with a CLOCK_OUT
    throw new Error('Employee is not currently clocked in or last clock-in already has a clock-out.');
  }

  const clockOutEvent = await ClockEvent.create({
    employeeId,
    eventType: 'CLOCK_OUT',
    timestamp: new Date(),
  });

  return { clockInEvent: lastClockInEvent, clockOutEvent };
};

const getClockStatus = async (employeeId) => {
  if (!employeeId) {
    return { isClockedIn: false, lastEvent: null, recentEvents: [] };
  }
  // Fetch the last 3 events for the employee, ordered by most recent first
  const recentEvents = await ClockEvent.findAll({
    where: { employeeId },
    order: [['timestamp', 'DESC']],
    limit: 3,
  });

  const lastEvent = recentEvents.length > 0 ? recentEvents[0] : null;

  return {
    isClockedIn: lastEvent ? lastEvent.eventType === 'CLOCK_IN' : false,
    lastEvent: lastEvent,
    recentEvents: recentEvents,
  };
};

module.exports = {
  clockIn,
  clockOut,
  getClockStatus,
}; 