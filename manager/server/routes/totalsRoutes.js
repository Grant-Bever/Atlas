const express = require('express');
const totalsController = require('../controllers/totalsController');
// const authMiddleware = require('../middleware/authMiddleware'); // Optional auth

const router = express.Router();

// router.use(authMiddleware); // Apply auth if needed

// GET /api/totals/weekly - Get weekly totals per customer
router.get('/weekly', totalsController.getWeeklyTotals);

module.exports = router; 