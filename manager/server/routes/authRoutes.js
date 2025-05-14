const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const { Manager, Employee, Customer } = require('../models');

// Add CORS headers directly to auth routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// POST /api/auth/manager/signup
router.post('/manager/signup', authController.managerSignUp);

// POST /api/auth/employee/signup
router.post('/employee/signup', authController.employeeSignUp);

// POST /api/auth/customer/signup
router.post('/customer/signup', authController.customerSignUp);

// --- Login Routes ---
// POST /api/auth/manager/login
router.post('/manager/login', authController.managerLogin);

// POST /api/auth/employee/login
router.post('/employee/login', authController.employeeLogin);

// POST /api/auth/customer/login
router.post('/customer/login', authController.customerLogin);

// Verify token and return user info
router.get('/verify-token', async (req, res) => {
  try {
    // Get token from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atlas-dev-secret');
    
    // Find the user by ID and role
    let user;
    
    if (decoded.role === 'manager') {
      user = await Manager.findByPk(decoded.userId);
    } else if (decoded.role === 'employee') {
      user = await Employee.findByPk(decoded.userId);
    } else if (decoded.role === 'customer') {
      user = await Customer.findByPk(decoded.userId);
    } else {
      return res.status(401).json({ message: 'Invalid user role' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info without sensitive fields
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: decoded.role
    };
    
    // If employee, include hourly rate
    if (decoded.role === 'employee' && user.hourly_rate) {
      userResponse.hourlyRate = user.hourly_rate;
    }
    
    return res.json({ user: userResponse });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// TODO: Add manager login route: router.post('/manager/login', authController.managerLogin);
// TODO: Add employee login route
// TODO: Add customer login route

module.exports = router; 