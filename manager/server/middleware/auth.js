const jwt = require('jsonwebtoken');
// const { Employee } = require('../models'); // Adjust path if models are elsewhere
const { EmployeeManagerModel } = require('../models'); // Use the correct model name

// Middleware to authenticate employee requests using JWT
const authenticateEmployee = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided.' });
  }

  try {
    // Verify the token using your JWT secret
    // IMPORTANT: Replace 'YOUR_JWT_SECRET' with your actual secret key from .env or config
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET');

    // Find the employee based on the ID in the token payload
    // const employee = await Employee.findByPk(decoded.id); // Assuming token payload has 'id'
    const employee = await EmployeeManagerModel.findByPk(decoded.id); // Use the correct model name

    if (!employee) {
      return res.status(401).json({ message: 'Authentication failed: Employee not found.' });
    }

    // Attach the authenticated employee object to the request for later use
    req.employee = employee;
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
    // Adjust the condition based on your Employee model (e.g., role === 'manager', isManager === true)
    // if (req.employee.role !== 'manager') { // Example check - Assuming EmployeeManagerModel has 'role'
    if (req.employee && req.employee.role !== 'manager') { // Ensure req.employee exists before checking role
        return res.status(403).json({ message: 'Forbidden: Manager access required.' });
    }
    next(); // User is a manager, proceed
};


module.exports = {
    authenticateEmployee,
    isManager // Export isManager if you need it elsewhere
}; 