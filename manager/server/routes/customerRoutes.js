const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get all products
router.get('/products', customerController.getProducts);

// Get all categories
router.get('/categories', customerController.getCategories);

// Get products by category
router.get('/products/category/:categoryId', customerController.getProductsByCategory);

// Create a new order
router.post('/orders', customerController.createOrder);

// Get orders for a customer
router.get('/orders/:customerId', customerController.getCustomerOrders);

// Add this at the top of your routes (after router definition)
router.get('/test', (req, res) => {
  res.json({ message: 'Customer routes are working!' });
});

module.exports = router;
