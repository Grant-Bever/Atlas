const db = require('../models');
const { Inventory } = db; // Assuming your inventory model is named 'Inventory'
const { Op } = require('sequelize');

/**
 * Fetches all inventory items and groups them by category.
 * @returns {Promise<Array<object>>} E.g., [{ category: 'Beef', items: [...] }, ...]
 */
const getAllInventoryGrouped = async () => {
    try {
        const allItems = await Inventory.findAll({
            order: [
                ['category', 'ASC'], // Group categories together
                ['name', 'ASC']      // Sort items within category
            ],
            raw: true // Get plain objects
        });

        // Group items by category
        const grouped = {};
        allItems.forEach(item => {
            const category = item.category || 'Miscellaneous'; // Default category if null/empty
            if (!grouped[category]) {
                grouped[category] = {
                    category: category,
                    items: []
                };
            }
            // Map DB fields to expected frontend fields if necessary (e.g., price_per_pound)
            // Assuming direct mapping for now based on initialInventory structure
            grouped[category].items.push({
                id: item.id,
                name: item.name,
                quantity: parseFloat(item.quantity) || 0, // Ensure number
                // Adapt field names based on your actual Inventory model definition
                pricePerPound: item.price_per_pound ? (parseFloat(item.price_per_pound) || 0) : null,
                pricePerBox: item.price_per_box ? (parseFloat(item.price_per_box) || 0) : null,
                // Add other relevant fields
            });
        });

        // Convert grouped object to array
        return Object.values(grouped);

    } catch (error) {
        console.error("Error fetching grouped inventory:", error);
        throw new Error('Failed to fetch inventory.');
    }
};

/**
 * Fetches a single inventory item by its ID.
 * @param {number} itemId
 * @returns {Promise<Inventory|null>} The inventory item instance or null if not found.
 */
const getItemById = async (itemId) => {
    try {
        const item = await Inventory.findByPk(itemId);
        return item; // Returns the instance or null
    } catch (error) {
        console.error(`Error fetching inventory item ${itemId}:`, error);
        throw new Error(`Failed to fetch inventory item ${itemId}.`);
    }
};

/**
 * Adds a new inventory item.
 * @param {object} itemData - Data for the new item (name, category, quantity, price_per_pound, etc.)
 * @returns {Promise<Inventory>} The created inventory item instance.
 */
const addItem = async (itemData) => {
    const { name, category, quantity, price_per_pound, price_per_box } = itemData;

    if (!name || !category) {
        throw new Error('Item name and category are required.');
    }

    try {
        // Check if item with the same name already exists (case-insensitive check)
        const existingItem = await Inventory.findOne({ where: { name: { [Op.iLike]: name } } });
        if (existingItem) {
            throw new Error(`An inventory item with the name "${name}" already exists.`);
        }

        const newItem = await Inventory.create({
            name: name,
            category: category,
            quantity: quantity || 0,
            // Map frontend fields to DB column names (e.g., pricePerPound -> price_per_pound)
            price_per_pound: price_per_pound,
            price_per_box: price_per_box,
            // Add other fields as needed
        });
        console.log(`Added new inventory item: ${newItem.name} (ID: ${newItem.id})`);
        return newItem;
    } catch (error) {
        console.error("Error adding inventory item:", error);
        // Re-throw specific validation errors or a generic one
        throw new Error(error.message || 'Failed to add inventory item.');
    }
};

/**
 * Updates an existing inventory item.
 * @param {number} itemId
 * @param {object} updateData - Fields to update (name, category, price_per_pound, etc.)
 * @returns {Promise<Inventory>} The updated inventory item instance.
 */
const updateItem = async (itemId, updateData) => {
    const { name, category, price_per_pound, price_per_box } = updateData;

    try {
        const item = await Inventory.findByPk(itemId);
        if (!item) {
            throw new Error(`Inventory item with ID ${itemId} not found.`);
        }

        // If name is being updated, check for conflicts with *other* items
        if (name && name !== item.name) {
            const existingItem = await Inventory.findOne({
                where: {
                    name: { [Op.iLike]: name },
                    id: { [Op.ne]: itemId } // Exclude the current item
                }
            });
            if (existingItem) {
                throw new Error(`Another inventory item with the name "${name}" already exists.`);
            }
            item.name = name;
        }

        // Update other fields if provided
        if (category !== undefined) item.category = category;
        if (price_per_pound !== undefined) item.price_per_pound = price_per_pound;
        if (price_per_box !== undefined) item.price_per_box = price_per_box;
        // IMPORTANT: Do NOT update quantity here. Use addQuantity/subtractQuantity.

        await item.save();
        console.log(`Updated inventory item: ${item.name} (ID: ${item.id})`);
        return item;

    } catch (error) {
        console.error(`Error updating inventory item ${itemId}:`, error);
        throw new Error(error.message || `Failed to update inventory item ${itemId}.`);
    }
};

/**
 * Adds a specified quantity to an inventory item.
 * @param {number} itemId
 * @param {number} amountToAdd - The quantity to add (must be positive).
 * @returns {Promise<Inventory>} The updated inventory item instance.
 */
const addQuantity = async (itemId, amountToAdd) => {
    const quantity = parseFloat(amountToAdd);
    if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Quantity to add must be a positive number.');
    }

    try {
        const item = await Inventory.findByPk(itemId);
        if (!item) {
            throw new Error(`Inventory item with ID ${itemId} not found.`);
        }

        // Use Sequelize increment for atomic update
        await item.increment('quantity', { by: quantity });
        console.log(`Added ${quantity} to inventory item: ${item.name} (ID: ${item.id}). New quantity: ${item.quantity + quantity}`); // Note: item.quantity might be stale here

        // Refetch to get the guaranteed updated value
        await item.reload();
        return item;

    } catch (error) {
        console.error(`Error adding quantity to inventory item ${itemId}:`, error);
        throw new Error(error.message || `Failed to add quantity for item ${itemId}.`);
    }
};

/**
 * Deletes an inventory item.
 * @param {number} itemId
 * @returns {Promise<void>}
 */
const deleteItem = async (itemId) => {
    try {
        const item = await Inventory.findByPk(itemId);
        if (!item) {
            throw new Error(`Inventory item with ID ${itemId} not found.`);
        }

        const itemName = item.name;
        await item.destroy();
        console.log(`Deleted inventory item: ${itemName} (ID: ${itemId})`);

    } catch (error) {
        console.error(`Error deleting inventory item ${itemId}:`, error);
        throw new Error(error.message || `Failed to delete inventory item ${itemId}.`);
    }
};

module.exports = {
    getAllInventoryGrouped,
    getItemById,
    addItem,
    updateItem,
    addQuantity,
    deleteItem
}; 