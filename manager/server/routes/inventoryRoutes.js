const express = require('express');
const inventoryController = require('../controllers/inventoryController');
// const authMiddleware = require('../middleware/authMiddleware'); // Optional: Add auth later

const router = express.Router();

// Optional: Apply authentication middleware to all inventory routes
// router.use(authMiddleware);

// GET /api/inventory - Fetch all items, grouped by category
router.get('/', inventoryController.getAllInventory);

// GET /api/inventory/:itemId - Fetch a single item by ID
router.get('/:itemId', inventoryController.getItemById);

// POST /api/inventory - Add a new inventory item
router.post('/', inventoryController.addItem);

// PUT /api/inventory/:itemId - Update an existing inventory item
router.put('/:itemId', inventoryController.updateItem);

// PATCH /api/inventory/:itemId/add-quantity - Add quantity to an item
router.patch('/:itemId/add-quantity', inventoryController.addQuantity);

// DELETE /api/inventory/:itemId - Delete an inventory item
router.delete('/:itemId', inventoryController.deleteItem);


module.exports = router; 