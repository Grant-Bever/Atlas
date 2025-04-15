const totalsService = require('../services/totalsService');

// Controller to get weekly totals per customer
const getWeeklyTotals = async (req, res) => {
  try {
    const weeklyTotals = await totalsService.getWeeklyTotals();
    res.status(200).json(weeklyTotals);
  } catch (error) {
    console.error('Controller error getting weekly totals:', error.message);
    res.status(500).json({ message: 'Failed to retrieve weekly totals', error: error.message });
  }
};

module.exports = {
  getWeeklyTotals
}; 