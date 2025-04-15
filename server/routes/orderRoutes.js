const express = require('express');
const orderController = require('../controllers/orderController');
// Optional: Add authentication middleware if needed
// const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes below if needed
// router.use(authMiddleware);

// POST /api/orders - Create a new invoice
router.post('/', orderController.createInvoice);

// GET /api/orders/active - Get all active (not completed) invoices
router.get('/active', orderController.getActiveInvoices);

// GET /api/orders/completed - Get all completed invoices
router.get('/completed', orderController.getCompletedInvoices);

// PUT /api/orders/:id - Update an invoice (e.g., mark as complete, paid)
router.put('/:id', orderController.updateInvoice);

// DELETE /api/orders/:id - Delete an invoice
router.delete('/:id', orderController.deleteInvoice);

module.exports = router; 