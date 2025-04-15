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
    const [customer, created] = await Customer.findOrCreate({
      where: { 
        name: { [Op.iLike]: customerName.trim() } 
      },
      defaults: { // Fields to use if the customer needs to be created
        name: customerName.trim(),
        phone: customerPhone.trim(),
        // Set email and password to null by default now that DB allows it
        email: null, 
        password: null 
      },
      transaction // Ensure findOrCreate is part of the transaction
    });

    if (created) {
        console.log(`Created new customer: ${customer.name} (ID: ${customer.id})`);
    } else {
        console.log(`Found existing customer: ${customer.name} (ID: ${customer.id})`);
        // Optional: Update phone number if it differs? Decide based on requirements.
        // if (customer.phone !== customerPhone.trim()) {
        //    await customer.update({ phone: customerPhone.trim() }, { transaction });
        //    console.log(`Updated phone for customer ${customer.id}`);
        // }
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
 * @returns {Promise<Array<object>>} Array of active invoice objects.
 */
const getActiveInvoices = async () => {
  try {
    return await Invoice.findAll({
      where: { completed: false },
      include: [
        { model: InvoiceItem, as: 'items' },
        { model: Customer, as: 'customer' }
      ],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  } catch (error) {
    console.error("Error fetching active invoices:", error);
    throw new Error('Failed to fetch active invoices.');
  }
};

/**
 * Retrieves completed invoices, optionally with items and customer.
 * @returns {Promise<Array<object>>} Array of completed invoice objects.
 */
const getCompletedInvoices = async () => {
  try {
    return await Invoice.findAll({
      where: { completed: true },
      include: [
        { model: InvoiceItem, as: 'items' },
        { model: Customer, as: 'customer' }
      ],
      order: [['date', 'DESC'], ['id', 'DESC']]
    });
  } catch (error) {
    console.error("Error fetching completed invoices:", error);
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