const { PayPeriod, Employee } = require('../models'); // Adjust if Employee is not needed directly
const { Op } = require('sequelize');
const moment = require('moment-timezone'); // For robust date/time handling

// Helper to get the start (Sunday) and end (Saturday) of the week for a given date
const getWeekRange = (dateInput) => {
  const date = moment(dateInput).tz('America/New_York'); // Use a specific timezone
  const startDate = date.clone().startOf('week'); // Sunday
  const endDate = date.clone().endOf('week');   // Saturday
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