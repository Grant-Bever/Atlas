const inventoryService = require('../services/inventoryService');

// GET /api/inventory - Get all items grouped by category
const getAllInventory = async (req, res) => {
    try {
        const groupedInventory = await inventoryService.getAllInventoryGrouped();
        res.status(200).json(groupedInventory);
    } catch (error) {
        console.error('Controller error getting inventory:', error.message);
        res.status(500).json({ message: 'Failed to retrieve inventory', error: error.message });
    }
};

// GET /api/inventory/:itemId - Get a single item by ID
const getItemById = async (req, res) => {
    const { itemId } = req.params;
    try {
        // Assuming inventoryService has a getItemById function
        const item = await inventoryService.getItemById(parseInt(itemId, 10)); 
        if (!item) {
            return res.status(404).json({ message: `Inventory item with ID ${itemId} not found.` });
        }
        res.status(200).json(item);
    } catch (error) {
        console.error(`Controller error getting item ${itemId}:`, error.message);
        res.status(500).json({ message: `Failed to retrieve inventory item ${itemId}`, error: error.message });
    }
};

// POST /api/inventory - Add a new item
const addItem = async (req, res) => {
    try {
        // Add validation for request body here if needed (e.g., using express-validator)
        const newItem = await inventoryService.addItem(req.body);
        res.status(201).json(newItem); // 201 Created
    } catch (error) {
        console.error('Controller error adding item:', error.message);
        // Send specific error messages (like duplicate name) back to client
        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        if (error.message.includes('required')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to add inventory item', error: error.message });
    }
};

// PUT /api/inventory/:itemId - Update an existing item
const updateItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        const updatedItem = await inventoryService.updateItem(parseInt(itemId, 10), req.body);
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error(`Controller error updating item ${itemId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        res.status(500).json({ message: `Failed to update inventory item ${itemId}`, error: error.message });
    }
};

// PATCH /api/inventory/:itemId/add-quantity - Add quantity to an item
const addQuantity = async (req, res) => {
    const { itemId } = req.params;
    const { amountToAdd } = req.body; // Expect { "amountToAdd": 5 }

    if (amountToAdd === undefined) {
        return res.status(400).json({ message: "Missing 'amountToAdd' in request body."});
    }

    try {
        const updatedItem = await inventoryService.addQuantity(parseInt(itemId, 10), amountToAdd);
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error(`Controller error adding quantity to item ${itemId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('positive number')) {
            return res.status(400).json({ message: error.message }); // Bad Request
        }
        res.status(500).json({ message: `Failed to add quantity for item ${itemId}`, error: error.message });
    }
};

// DELETE /api/inventory/:itemId - Delete an item
const deleteItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        await inventoryService.deleteItem(parseInt(itemId, 10));
        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error(`Controller error deleting item ${itemId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to delete inventory item ${itemId}`, error: error.message });
    }
};

module.exports = {
    getAllInventory,
    getItemById,
    addItem,
    updateItem,
    addQuantity,
    deleteItem
}; 