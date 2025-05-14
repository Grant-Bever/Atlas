const db = require('../models'); // Imports index.js which initializes Sequelize and models
const { Invoice, InvoiceItem, Customer } = db;
const { Op } = require('sequelize'); // Import Operators
const { encryptData } = require('../utils/securityUtils'); // Added import

/**
 * Creates a new invoice along with its items.
 * Finds or creates customer by name (case-insensitive) and phone.
 * @param {object} invoiceData - Data for the invoice header (customerName, customerPhone, date, total, items array).
 * @returns {Promise<object>} The created invoice object with items.
 */
const createInvoice = async (invoiceData) => {
  console.log('<<<<< RUNNING orderService.createInvoice - VERSION 2 (with encrypted_phone_number) >>>>>');
  // Destructure customerName and customerPhone
  const { customerName, customerPhone, date, total, checked_out = false, paid = false, completed = false, items = [], customerEmail } = invoiceData; // Added customerEmail

  // Basic validation
  if (!customerName || !customerPhone || !date || total === undefined || !Array.isArray(items)) {
    throw new Error('Missing required invoice data (customerName, customerPhone, date, total, items array).');
  }

  let customer_id;
  const transaction = await db.sequelize.transaction(); // Start transaction early for findOrCreate

  try {
    // --- Find or Create Customer ---
    const trimmedPhone = customerPhone.trim();
    const encryptedPhone = trimmedPhone ? encryptData(trimmedPhone) : null;

    // Prepare a placeholder email if not provided and a new customer might be created.
    // This is a temporary workaround for the NOT NULL constraint on Customer.email.
    // Consider making email optional in the Customer model or collecting it in the invoice form.
    const placeholderEmail = customerEmail || `${customerName.trim().replace(/\s+/g, '.').toLowerCase()}.${Date.now()}@placeholder.atlas.com`;

    const [customer, created] = await Customer.findOrCreate({
      where: { 
        // Attempt to find by encrypted phone number.
        // This relies on encryptData using a consistent IV for the same input.
        encrypted_phone_number: encryptedPhone 
      },
      defaults: { 
        name: customerName.trim(),
        encrypted_phone_number: encryptedPhone,
        // Provide a placeholder email or use the one from invoiceData if available
        // Customer model requires email, and it must be unique.
        email: placeholderEmail, 
        password_hash: null // Assuming customers created via invoice don't have a password initially
      },
      transaction
    });

    if (created) {
        console.log(`Created new customer: ${customer.name} with encrypted phone (ID: ${customer.id})`);
    } else {
        console.log(`Found existing customer by encrypted phone: ${customer.name} (ID: ${customer.id})`);
        // If customer was found, but name is different, do not update customer's name from invoice data.
        // If email was different, we might have an issue if the placeholder was used and this customer already existed.
        // This scenario needs careful consideration if a customer is found by phone but has a different name/email.
        // For now, we proceed with the found customer.
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