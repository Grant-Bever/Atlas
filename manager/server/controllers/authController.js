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

// TODO: Implement login controller functions for employee and customer

// TODO: Implement managerLogin controller function 