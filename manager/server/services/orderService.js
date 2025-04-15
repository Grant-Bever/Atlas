const db = require('../models'); // Imports index.js which initializes Sequelize and models
const { Invoice, InvoiceItem, Customer } = db;
const { Op } = require('sequelize'); // Import Operators

/**
 * Creates a new invoice along with its items.
 * Finds or creates customer by name (case-insensitive) and phone.
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
      const invoiceItemsData = items.map(item => ({
        ...item,
        invoice_id: newInvoice.id
      }));
      await InvoiceItem.bulkCreate(invoiceItemsData, { transaction });
    }

    // --- Commit Transaction ---
    await transaction.commit();

    // --- Refetch and Return Result ---
    const result = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: InvoiceItem, as: 'items' },
        { model: Customer, as: 'customer' }
      ]
    });
    return result;

  } catch (error) {
    // --- Rollback Transaction on Error ---
    if (transaction) await transaction.rollback();
    console.error("Error creating invoice in service:", error);
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