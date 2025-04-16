const db = require('../models'); // Imports index.js which initializes Sequelize and models
const { Invoice, InvoiceItem, Customer } = db;
const { Op } = require('sequelize'); // Import Operators
const { getIo } = require('../socketManager'); // Import getIo

/**
 * Creates a new invoice along with its items.
 * Finds or creates customer by name (case-insensitive) and phone.
 * Emits a 'new_order' event via Socket.IO upon successful creation.
 * @param {object} invoiceData - Data for the invoice header (customerName, customerPhone, date, total, items array).
 * @returns {Promise<object>} The created invoice object with items.
 */
const createInvoice = async (invoiceData) => {
  // Destructure customerName and customerPhone
  const { customerName, customerPhone, date, total, checked_out = false, paid = false, completed = false, items = [] } = invoiceData;

  // Basic validation
  if (!customerName || !customerPhone || !date || total === undefined || !Array.isArray(items)) {
    throw new Error('Missing required invoice data (customerName, customerPhone, date, total, items array).');
  }

  let customer_id;
  const transaction = await db.sequelize.transaction(); // Start transaction early for findOrCreate

  try {
    // --- Find or Create Customer ---
    // Find based on phone number, create with name/phone if not found.
    const [customer, created] = await Customer.findOrCreate({
      where: { 
        // Find using phone number (assuming phone is unique or reliable enough)
        phone: customerPhone.trim() 
      },
      defaults: { // Fields to use ONLY if the customer needs to be created
        name: customerName.trim(), // Use name from input for new customer
        phone: customerPhone.trim(),
        email: null, // Default other fields
        password: null 
      },
      transaction // Ensure findOrCreate is part of the transaction
    });

    if (created) {
        console.log(`Created new customer: ${customer.name} with phone ${customer.phone} (ID: ${customer.id})`);
    } else {
        console.log(`Found existing customer by phone ${customer.phone}: ${customer.name} (ID: ${customer.id})`);
        // **IMPORTANT**: Do NOT update the existing customer's name here based on checkout input.
        // If the name provided in checkout (customerName) is different from customer.name,
        // that information is relevant to *this order* but shouldn't change the Customer record itself.
        // If you need to update customer profiles, that should be a separate feature/endpoint.
    }

    customer_id = customer.id;

    // --- Create Invoice --- 
    const newInvoice = await Invoice.create({
      customer_id, // Use the found or created ID
      date,
      total,
      checked_out,
      paid,
      completed
    }, { transaction });

    // --- Create Invoice Items ---
    if (items.length > 0) {
      // Map items from invoiceData to the format needed for InvoiceItem creation
      const itemsData = items.map(item => {
        // Validate item structure received by the service
        if (item.id === undefined || item.quantity === undefined || item.price_per_pound === undefined || item.name === undefined) {
          console.error('[Order Service] Invalid item structure in itemsData:', item);
          throw new Error('Invalid item data: Missing id, quantity, price_per_pound, or name.');
        }

        // Calculate amount
        const quantity = parseFloat(item.quantity);
        const price = parseFloat(item.price_per_pound);
        if (isNaN(quantity) || isNaN(price)) {
            console.error('[Order Service] Invalid quantity or price for item:', item);
            throw new Error('Invalid quantity or price for item. Cannot calculate amount.');
        }
        const amount = quantity * price;

        return {
          invoice_id: newInvoice.id,
          item_id: item.id, // Link to the Inventory item
          item: item.name,
          quantity: quantity,
          price: price, // Store the price per unit/pound at the time of order
          amount: amount, // Store the calculated total amount for this line item
          // Add other relevant fields from item if needed, e.g., item category snapshot
          // notes: item.notes, // Example if notes were included
          // weight: item.weight, // Example if weight was included
        };
      });

      console.log('[Order Service] Mapped itemsData for bulkCreate:', JSON.stringify(itemsData, null, 2));

      // Bulk create invoice items if there are any
      if (itemsData.length > 0) {
        await InvoiceItem.bulkCreate(itemsData, { transaction });
        console.log(`[Order Service] Successfully created ${itemsData.length} invoice items for Invoice ID: ${newInvoice.id}`);
      } else {
        console.log(`[Order Service] No items provided for Invoice ID: ${newInvoice.id}`);
      }
    }

    // --- Commit Transaction ---
    await transaction.commit();
    console.log('[Order Service] Transaction committed for new invoice.'); // Log commit success

    // --- Refetch and Return Result ---
    let result = null; // Define result outside try block
    try {
        console.log(`[Order Service] Refetching Invoice with ID: ${newInvoice.id}`);
        result = await Invoice.findByPk(newInvoice.id, {
            include: [
                { model: InvoiceItem, as: 'items' },
                { model: Customer, as: 'customer' }
            ]
        });
        console.log('[Order Service] Refetch result:', result ? `Invoice ID ${result.id} found` : 'Invoice not found after commit');
    } catch (refetchError) {
        console.error('[Order Service] Error during refetch after commit:', refetchError);
        // Decide if you should still attempt to emit or throw
        // For now, we'll proceed to check `result` which will be null
    }

    // --- Emit Socket.IO Event --- 
    if (result) {
        try {
            const io = getIo(); // Get the io instance
            const orderDataForEmit = result.toJSON(); // Get plain JSON data
            console.log('[Socket Emit] Attempting to emit new_order for order:', orderDataForEmit.id);
            console.log('[Socket Emit] Data:', JSON.stringify(orderDataForEmit, null, 2)); // Log the data being sent
            
            io.emit('new_order', orderDataForEmit); // Emit event with the new invoice data
            
            console.log('[Socket Emit] Successfully emitted new_order event for invoice:', result.id);
        } catch (socketError) {
            console.error("[Socket Emit] Error emitting new_order event:", socketError);
            // Continue even if socket fails, order was still created
        }
    } else {
        // Log if result was null/undefined, preventing emit
        console.log('[Socket Emit] Skipped emit because refetched result was null/undefined.');
    }

    return result;

  } catch (error) {
    // --- Rollback Transaction on Error ---
    if (transaction && transaction.finished !== 'commit' && transaction.finished !== 'rollback') {
        // Add more specific logging inside the main catch block
        console.error("[Order Service] Error caught in main try block:", error);
        await transaction.rollback();
        console.error("[Order Service] Transaction rolled back due to error.");
    }
    // Check for specific validation errors from Sequelize if needed
    // if (error.name === 'SequelizeValidationError') { ... }
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
};

/**
 * Retrieves active (not completed) invoices, optionally with items and customer.
 * Allows filtering by customer name and sorting.
 * @param {object} options - Filtering and sorting options.
 * @param {string} [options.searchCustomer] - Search term for customer name.
 * @param {string} [options.sortBy='date'] - Column to sort by ('date', 'total', 'customerName').
 * @param {string} [options.sortDir='DESC'] - Sort direction ('ASC', 'DESC').
 * @returns {Promise<Array<object>>} Array of active invoice objects.
 */
const getActiveInvoices = async (options = {}) => {
  const { searchCustomer, sortBy = 'date', sortDir = 'DESC' } = options;
  const whereClause = { completed: false };
  const includeClause = [
      { model: InvoiceItem, as: 'items' },
      { model: Customer, as: 'customer' }
  ];
  let orderClause = [];

  // Add search condition if provided
  if (searchCustomer) {
    // Add where condition to the included Customer model
     includeClause.find(inc => inc.as === 'customer').where = {
         name: { [Op.iLike]: `%${searchCustomer}%` } // Case-insensitive partial match
     };
  }

  // Determine sorting column and direction
  const direction = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  if (sortBy === 'customerName') {
    // Sort by associated customer name
    orderClause.push([Customer, 'name', direction]);
  } else if (sortBy === 'total') {
    orderClause.push(['total', direction]);
  } else {
    // Default sort by date
    orderClause.push(['date', direction]);
  }
  // Add secondary sort by ID to ensure consistent ordering
  orderClause.push(['id', 'DESC']);

  try {
    return await Invoice.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
      required: !!searchCustomer // Make Customer include mandatory if searching by it
    });
  } catch (error) {
    console.error("Error fetching active invoices with options:", error);
    throw new Error('Failed to fetch active invoices.');
  }
};

/**
 * Retrieves completed invoices, optionally with items and customer.
 * Allows filtering by customer name and sorting.
 * @param {object} options - Filtering and sorting options.
 * @param {string} [options.searchCustomer] - Search term for customer name.
 * @param {string} [options.sortBy='date'] - Column to sort by ('date', 'total', 'customerName').
 * @param {string} [options.sortDir='DESC'] - Sort direction ('ASC', 'DESC').
 * @returns {Promise<Array<object>>} Array of completed invoice objects.
 */
const getCompletedInvoices = async (options = {}) => {
  const { searchCustomer, sortBy = 'date', sortDir = 'DESC' } = options;
  const whereClause = { completed: true };
  const includeClause = [
      { model: InvoiceItem, as: 'items' },
      { model: Customer, as: 'customer' }
  ];
  let orderClause = [];

  // Add search condition if provided
  if (searchCustomer) {
     includeClause.find(inc => inc.as === 'customer').where = {
         name: { [Op.iLike]: `%${searchCustomer}%` }
     };
  }

  // Determine sorting column and direction
  const direction = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  if (sortBy === 'customerName') {
    orderClause.push([Customer, 'name', direction]);
  } else if (sortBy === 'total') {
    orderClause.push(['total', direction]);
  } else {
    orderClause.push(['date', direction]);
  }
  orderClause.push(['id', 'DESC']);

  try {
    return await Invoice.findAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
      required: !!searchCustomer // Make Customer include mandatory if searching by it
    });
  } catch (error) {
    console.error("Error fetching completed invoices with options:", error);
    throw new Error('Failed to fetch completed invoices.');
  }
};

/**
 * Retrieves a single invoice by its ID, including items and customer.
 * @param {number} id - The ID of the invoice to retrieve.
 * @returns {Promise<object|null>} The invoice object or null if not found.
 */
const getInvoiceById = async (id) => {
  try {
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: InvoiceItem, as: 'items' },
        { model: Customer, as: 'customer' }
      ]
    });
    return invoice; // Will be null if not found
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    throw new Error(`Failed to fetch invoice ${id}.`);
  }
};

/**
 * Updates an existing invoice. Can update status flags or other fields.
 * Does not handle item updates directly in this version.
 * @param {number} id - The ID of the invoice to update.
 * @param {object} updateData - An object containing fields to update (e.g., { completed: true, paid: true }).
 * @returns {Promise<object|null>} The updated invoice object or null if not found.
 */
const updateInvoice = async (id, updateData) => {
  // Prevent updating primary key or foreign keys directly this way
  delete updateData.id;
  delete updateData.customer_id;
  delete updateData.customerName;
  delete updateData.customerPhone;

  try {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return null; 
    }

    await invoice.update(updateData);

    return await Invoice.findByPk(id, {
        include: [
            { model: InvoiceItem, as: 'items' },
            { model: Customer, as: 'customer' }
        ]
    });
  } catch (error) {
    console.error(`Error updating invoice ${id}:`, error);
    throw new Error(`Failed to update invoice ${id}.`);
  }
};

/**
 * Deletes an invoice by its ID.
 * Associated InvoiceItems will be deleted due to ON DELETE CASCADE.
 * @param {number} id - The ID of the invoice to delete.
 * @returns {Promise<boolean>} True if deleted successfully, false otherwise.
 */
const deleteInvoice = async (id) => {
  try {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return false; // Not found
    }

    await invoice.destroy();
    return true;
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    throw new Error(`Failed to delete invoice ${id}.`);
  }
};


module.exports = {
  createInvoice,
  getActiveInvoices,
  getCompletedInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}; 