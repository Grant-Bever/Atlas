const db = require('../models');
const { Invoice, InvoiceItem, Customer, Inventory } = db;
const { Op } = require('sequelize');

// Get all available products (inventory)
const getProducts = async (req, res) => {
  try {
    const products = await Inventory.findAll({
      where: {
        quantity: {
          [Op.gt]: 0 // Only return products with quantity > 0
        }
      },
      attributes: ['id', 'name', 'category', 'price_per_pound', 'quantity']
    });
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  
  try {
    const products = await Inventory.findAll({
      where: {
        category: categoryId,
        quantity: {
          [Op.gt]: 0 // Only return products with quantity > 0
        }
      },
      attributes: ['id', 'name', 'category', 'price_per_pound', 'quantity']
    });
    
    res.status(200).json(products);
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    res.status(500).json({ message: 'Failed to fetch products by category', error: error.message });
  }
};

// Get all product categories
const getCategories = async (req, res) => {
  try {
    // Get distinct categories from inventory
    const categories = await Inventory.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      raw: true
    });
    
    // Format the response with ids
    const formattedCategories = categories.map((item, index) => ({
      id: index + 1,
      name: item.category
    }));
    
    res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  const { customerInfo, items, total } = req.body;
  
  if (!customerInfo || !items || !Array.isArray(items) || items.length === 0 || total === undefined) {
    return res.status(400).json({ message: 'Missing required order data' });
  }
  
  const transaction = await db.sequelize.transaction();
  
  try {
    // Find or create customer
    const [customer, created] = await Customer.findOrCreate({
      where: { 
        phone: customerInfo.phone 
      },
      defaults: {
        name: customerInfo.name,
        email: customerInfo.email || null,
        password: null // No password for customer-created via order
      },
      transaction
    });
    
    // Create invoice
    const invoice = await Invoice.create({
      customer_id: customer.id,
      total: total,
      date: new Date(),
      checked_out: true,
      paid: false, // Will be set to true when payment is processed
      completed: false
    }, { transaction });
    
    // Create invoice items and update inventory
    const invoiceItems = [];
    
    for (const item of items) {
      // Check if enough inventory is available
      const inventoryItem = await Inventory.findByPk(item.id, { transaction });
      
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Not enough inventory for item: ${item.name}. Available: ${inventoryItem?.quantity || 0}` 
        });
      }
      
      // Create invoice item
      const invoiceItem = await InvoiceItem.create({
        invoice_id: invoice.id,
        quantity: item.quantity,
        price: item.price_per_pound,
        amount: item.price_per_pound * item.quantity,
        item: item.name,
        weight: item.quantity, // Assuming weight is same as quantity for simplicity
        notes: null
      }, { transaction });
      
      invoiceItems.push(invoiceItem);
      
      // Update inventory
      await inventoryItem.update({
        quantity: inventoryItem.quantity - item.quantity
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: invoice.id,
        total: invoice.total,
        date: invoice.date,
        items: invoiceItems
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get orders for a customer
const getCustomerOrders = async (req, res) => {
  const { customerId } = req.params;
  
  try {
    const orders = await Invoice.findAll({
      where: { customer_id: customerId },
      include: [{
        model: InvoiceItem,
        as: 'items'
      }],
      order: [['date', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    res.status(500).json({ message: 'Failed to fetch customer orders', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductsByCategory,
  getCategories,
  createOrder,
  getCustomerOrders
};
