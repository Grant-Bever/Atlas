const { PayPeriod, Employee } = require('../models'); // Adjust if Employee is not needed directly
const { Op } = require('sequelize');
const moment = require('moment-timezone'); // For robust date/time handling

// Helper to get the start (Saturday) and end (Friday) of the week for a given date
// Aligning with employeeService.js which uses Saturday as start of week
const getWeekRange = (dateInput) => {
  const date = moment(dateInput).tz('America/New_York'); // Use a specific timezone
  
  // Find the most recent Saturday (start of the week)
  const startDate = date.clone().startOf('day');
  while (startDate.day() !== 6) { // 6 is Saturday
      startDate.subtract(1, 'day');
  }
  
  // End date is the following Friday at end of day
  const endDate = startDate.clone().add(6, 'days').endOf('day');

  console.log('DEBUG payPeriodService - Date calculations:', {
    inputDate: date.format(),
    startDate: startDate.format(),
    endDate: endDate.format(),
    startDay: startDate.day(),
    endDay: endDate.day()
  });

  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  };
};

const getOrCreateCurrentPayPeriod = async () => {
  const today = new Date();
  const { startDate, endDate } = getWeekRange(today);

  let payPeriod = await PayPeriod.findOne({
    where: {
      startDate: startDate,
      endDate: endDate,
    },
  });

  if (!payPeriod) {
    payPeriod = await PayPeriod.create({
      startDate: startDate,
      endDate: endDate,
      status: 'active', // Default status for new pay periods
    });
  }
  return payPeriod;
};

// Optional: Get a pay period by its ID, ensuring it's active or valid
const getPayPeriodById = async (payPeriodId) => {
  const payPeriod = await PayPeriod.findByPk(payPeriodId);
  if (!payPeriod) {
    throw new Error('Pay period not found');
  }
  // Add any status checks if necessary, e.g., if only 'active' periods are valid for certain ops
  return payPeriod;
};


module.exports = {
  getOrCreateCurrentPayPeriod,
  getWeekRange, // Exporting for potential use elsewhere if needed
  getPayPeriodById,
}; 