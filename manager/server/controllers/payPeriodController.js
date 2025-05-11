const payPeriodService = require('../services/payPeriodService');

const getCurrentPayPeriod = async (req, res, next) => {
  try {
    // Assuming employeeId is not strictly needed if pay periods are global for the company
    // If employee-specific pay periods were a concept, you might pass req.user.id
    const payPeriod = await payPeriodService.getOrCreateCurrentPayPeriod();
    res.status(200).json(payPeriod);
  } catch (error) {
    console.error('Error getting current pay period:', error);
    next(error); // Pass to global error handler
  }
};

module.exports = {
  getCurrentPayPeriod,
}; 