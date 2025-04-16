const orderService = require('../services/orderService');

// Controller to handle creating a new invoice
const createInvoice = async (req, res) => {
  console.log('[Order Controller] Received request body:', JSON.stringify(req.body, null, 2)); // Keep detailed logging for now

  // Destructure the incoming request body
  const { customerInfo, items, total } = req.body;

  // Validate basic structure from frontend
  if (!customerInfo || !customerInfo.name || !customerInfo.phone || !Array.isArray(items) || total === undefined) {
    console.error('[Order Controller] Invalid request structure received:', req.body);
    return res.status(400).json({ message: 'Invalid invoice data structure received. Missing customerInfo, items, or total.' });
  }

  // Prepare data structure for the service
  const invoiceDataForService = {
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    date: new Date(), // Generate the date here
    total: total,
    items: items,
    // Include optional fields if needed, otherwise service defaults will apply
    // checked_out: req.body.checked_out, 
    // paid: req.body.paid,
    // completed: req.body.completed
  };

  console.log('[Order Controller] Data prepared for service:', JSON.stringify(invoiceDataForService, null, 2));

  try {
    // Pass the transformed data to the service
    const newInvoice = await orderService.createInvoice(invoiceDataForService);
    
    // Log the result from the service, especially the refetched data
    console.log('[Order Controller] Invoice created successfully by service. Refetched data:', newInvoice ? `Invoice ID ${newInvoice.id}` : 'Service returned null');

    if (!newInvoice) {
        // This case might happen if the service refetch fails after commit
        console.error('[Order Controller] Service created invoice but failed to refetch it.');
        // Decide on the response: 500 or maybe 201 with a warning?
        // Let's return 500 for now as the full data isn't confirmed.
        return res.status(500).json({ message: 'Invoice created but failed to retrieve confirmation data.' });
    }
    
    // If successful and refetched, return 201 Created
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error('[Order Controller] Error calling orderService.createInvoice:', error.message); // Log the specific error message
    console.error('[Order Controller] Full Error Stack:', error.stack); // Log stack for more detail
    // Handle specific error messages if needed
    if (error.message.includes('Missing required invoice data')) {
      res.status(400).json({ message: error.message }); // Send back validation error from service
    } else if (error.message.includes('Failed to create invoice')) {
      // General service failure
      res.status(500).json({ message: error.message });
    } else {
      // Other unexpected errors
      res.status(500).json({ message: 'An unexpected error occurred while creating the invoice.' });
    }
  }
};

// Controller to get active invoices
const getActiveInvoices = async (req, res) => {
  try {
    // Extract options from query parameters
    const options = {
      searchCustomer: req.query.searchCustomer,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    };
    const invoices = await orderService.getActiveInvoices(options);
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Controller error getting active invoices:', error.message);
    res.status(500).json({ message: 'Failed to retrieve active invoices', error: error.message });
  }
};

// Controller to get completed invoices
const getCompletedInvoices = async (req, res) => {
  try {
     // Extract options from query parameters
     const options = {
      searchCustomer: req.query.searchCustomer,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    };
    const invoices = await orderService.getCompletedInvoices(options);
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Controller error getting completed invoices:', error.message);
    res.status(500).json({ message: 'Failed to retrieve completed invoices', error: error.message });
  }
};

// Controller to get a single invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Missing invoice ID.' });
    }

    const invoice = await orderService.getInvoiceById(Number(id));

    if (!invoice) {
      return res.status(404).json({ message: `Invoice with ID ${id} not found.` });
    }
    res.status(200).json(invoice);
  } catch (error) {
    console.error(`Controller error getting invoice ${req.params.id}:`, error.message);
    res.status(500).json({ message: 'Failed to retrieve invoice', error: error.message });
  }
};

// Controller to update an invoice (e.g., mark as completed, paid)
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Missing invoice ID or update data.' });
    }

    const updatedInvoice = await orderService.updateInvoice(Number(id), updateData);

    if (!updatedInvoice) {
      return res.status(404).json({ message: `Invoice with ID ${id} not found.` });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(`Controller error updating invoice ${req.params.id}:`, error.message);
    res.status(500).json({ message: 'Failed to update invoice', error: error.message });
  }
};

// Controller to delete an invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Missing invoice ID.' });
    }

    const success = await orderService.deleteInvoice(Number(id));

    if (!success) {
      return res.status(404).json({ message: `Invoice with ID ${id} not found.` });
    }
    // Send No Content response on successful deletion
    res.status(204).send();
  } catch (error) {
    console.error(`Controller error deleting invoice ${req.params.id}:`, error.message);
    res.status(500).json({ message: 'Failed to delete invoice', error: error.message });
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