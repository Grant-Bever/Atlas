const jwt = require('jsonwebtoken');
const { Employee, Manager } = require('../models'); // Import the right models

// Middleware to authenticate employee requests using JWT
const authenticateEmployee = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided.' });
  }

  try {
    // Verify the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atlas-dev-secret');

    // Find the employee based on the ID in the token payload
    const employee = await Employee.findByPk(decoded.userId); // Use userId from token

    if (!employee) {
      return res.status(401).json({ message: 'Authentication failed: Employee not found.' });
    }

    // Attach the authenticated employee object to the request for later use
    req.employee = employee;
    // Also attach the user info for routes that expect it in this format
    req.user = { id: employee.id, role: 'employee' };
    
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    console.error('JWT Verification Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication failed: Token expired.' });
    }
    return res.status(500).json({ message: 'Authentication failed: Server error.' });
  }
};

// Middleware to check if the authenticated employee is a manager
const isManager = (req, res, next) => {
    // Ensure authenticateEmployee runs first
    if (!req.employee) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    // Check if the employee has a manager role/flag
    if (req.employee && req.employee.role !== 'manager') { 
        return res.status(403).json({ message: 'Forbidden: Manager access required.' });
    }
    next(); // User is a manager, proceed
};

// Middleware to authenticate manager requests using JWT
const authenticateManager = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atlas-dev-secret');

    // Check if the token was intended for a manager
    if (decoded.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden: Access restricted to managers.' });
    }

    // Find the manager based on the ID in the token payload
    const manager = await Manager.findByPk(decoded.userId);

    if (!manager) {
      return res.status(401).json({ message: 'Authentication failed: Manager not found.' });
    }

    // Attach the authenticated manager object to the request
    req.manager = manager;
    // For consistency if other parts of your system use req.user
    // You might set req.user specific to how managers are represented globally
    req.user = { id: manager.id, role: 'manager', name: manager.name }; 

    next(); // Proceed

  } catch (error) {
    console.error('JWT Verification Error (Manager):', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication failed: Token expired.' });
    }
    return res.status(500).json({ message: 'Authentication failed: Server error.' });
  }
};

module.exports = {
    authenticateEmployee,
    isManager,
    authenticateManager
}; 