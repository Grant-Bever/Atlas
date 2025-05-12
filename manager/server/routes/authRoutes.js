const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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

// TODO: Add manager login route: router.post('/manager/login', authController.managerLogin);
// TODO: Add employee login route
// TODO: Add customer login route

module.exports = router; 