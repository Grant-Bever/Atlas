const managerAuthService = require('../services/managerAuthService');
const employeeAuthService = require('../services/employeeAuthService');
const customerAuthService = require('../services/customerAuthService');
const { encryptData } = require('../utils/securityUtils');

exports.managerSignUp = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // --- Basic Server-Side Validation (align with frontend, but always re-validate) ---
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }
    // Email format
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    // Password strength (example, should match frontend validation precisely)
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-~`+=;'\[\]\\\/\|]/.test(password)) {
      return res.status(400).json({ message: 'Password does not meet strength requirements.' });
    }
    // Phone number format (if provided)
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
    }
    // --- End Validation ---

    const encryptedPhoneNumber = phoneNumber ? encryptData(phoneNumber) : null;
    if (phoneNumber && !encryptedPhoneNumber) {
        // Encryption failed, and phone number was provided
        console.error('Phone number encryption failed for email:', email);
        return res.status(500).json({ message: 'Error processing registration data.' });
    }

    const managerData = {
      name,
      email,
      password_hash: password, // The model hook will hash this
      encrypted_phone_number: encryptedPhoneNumber,
    };

    const newManager = await managerAuthService.createManager(managerData);
    
    // Exclude password_hash from the response
    const { password_hash, ...managerResponse } = newManager.toJSON();
    
    res.status(201).json({ message: 'Manager account created successfully', manager: managerResponse });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('Manager sign-up error:', error);
    res.status(500).json({ message: 'Internal server error during sign-up.' });
  }
};

exports.employeeSignUp = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Server-Side Validation (similar to managerSignUp)
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-~`+=;'\[\]\\\/\|]/.test(password)) {
      return res.status(400).json({ message: 'Password does not meet strength requirements.' });
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
    }

    const encryptedPhoneNumber = phoneNumber ? encryptData(phoneNumber) : null;
    if (phoneNumber && !encryptedPhoneNumber) {
        console.error('Phone encryption failed for employee email:', email);
        return res.status(500).json({ message: 'Error processing registration data.' });
    }

    const employeeData = {
      name,
      email,
      password_hash: password, // Model hook will hash
      encrypted_phone_number: encryptedPhoneNumber,
      // Add any other employee-specific default fields if necessary, e.g., is_active: true
    };

    const newEmployee = await employeeAuthService.createEmployee(employeeData);
    const { password_hash, ...employeeResponse } = newEmployee.toJSON();
    res.status(201).json({ message: 'Employee account created successfully', employee: employeeResponse });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('Employee sign-up error:', error);
    res.status(500).json({ message: 'Internal server error during sign-up.' });
  }
};

exports.customerSignUp = async (req, res) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Server-Side Validation (similar to managerSignUp)
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-~`+=;'\[\]\\\/\|]/.test(password)) {
      return res.status(400).json({ message: 'Password does not meet strength requirements.' });
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
    }

    const encryptedPhoneNumber = phoneNumber ? encryptData(phoneNumber) : null;
    if (phoneNumber && !encryptedPhoneNumber) {
        console.error('Phone encryption failed for customer email:', email);
        return res.status(500).json({ message: 'Error processing registration data.' });
    }

    const customerData = {
      name,
      email,
      password_hash: password, // Model hook will hash
      encrypted_phone_number: encryptedPhoneNumber,
    };

    const newCustomer = await customerAuthService.createCustomer(customerData);
    const { password_hash, ...customerResponse } = newCustomer.toJSON();
    res.status(201).json({ message: 'Customer account created successfully', customer: customerResponse });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('Customer sign-up error:', error);
    res.status(500).json({ message: 'Internal server error during sign-up.' });
  }
};

// --- Login Controllers ---

// Manager Login
exports.managerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await managerAuthService.loginManager(email, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message }); // Unauthorized
    }

    // On success, send back manager data (excluding password_hash)
    // In a real app, you would generate and send a JWT here
    res.status(200).json({ message: 'Manager login successful', manager: result.manager });

  } catch (error) {
    console.error('Manager login error:', error);
    res.status(500).json({ message: 'Error logging in manager', error: error.message });
  }
};

// Employee Login
exports.employeeLogin = async (req, res) => {
  console.log(`Employee login request received for email: ${req.body.email}`);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Employee login failed: Email or password missing.');
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await employeeAuthService.loginEmployee(email, password);
    if (!result.success) {
      console.log(`Employee login auth service failed for ${email}: ${result.message}`);
      return res.status(401).json({ message: result.message }); // Unauthorized
    }
    
    console.log(`Employee login successful for ${email}, sending response with token.`);
    res.status(200).json({ 
      message: 'Employee login successful', 
      user: {
        id: result.employee.id,
        name: result.employee.name,
        email: result.employee.email,
        role: 'employee',
        hourlyRate: result.employee.hourly_rate
      },
      token: result.token
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ message: 'Error logging in employee', error: error.message });
  }
};

// Customer Login
exports.customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await customerAuthService.loginCustomer(email, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message }); // Unauthorized
    }

    res.status(200).json({ message: 'Customer login successful', customer: result.customer });

  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'Error logging in customer', error: error.message });
  }
};

// TODO: Implement managerLogin controller function 