require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Imports models/index.js - initializes Sequelize

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const totalsRoutes = require('./routes/totalsRoutes'); // <-- Add totals routes
const employeeRoutes = require('./routes/employeeRoutes'); // <-- Import employee routes
const inventoryRoutes = require('./routes/inventoryRoutes'); // <-- Import inventory routes
const customerRoutes = require('./routes/customerRoutes');
const employeeSelfServiceRoutes = require('./routes/employeeSelfServiceRoutes'); // <-- IMPORT NEW ROUTES
const authRoutes = require('./routes/authRoutes'); // Import new auth routes
// Add other route imports here as you create them (e.g., inventoryRoutes)

const app = express();

// Trust the first proxy hop (common for Cloud Run/Load Balancers)
app.set('trust proxy', 1); 

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend requests
app.use(express.json()); // Parse incoming request bodies in JSON format
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Mount Routes ---
app.use('/api/orders', orderRoutes);
app.use('/api/totals', totalsRoutes); // <-- Mount totals routes
app.use('/api/employees', employeeRoutes); // <-- Mount employee routes
app.use('/api/inventory', inventoryRoutes); // <-- Mount inventory routes
app.use('/api/customer', customerRoutes);
app.use('/api/employee-self-service', employeeSelfServiceRoutes); // <-- MOUNT NEW ROUTES
app.use('/api/auth', authRoutes); // Mount new auth routes
// app.use('/api/inventory', inventoryRoutes); // Example for other routes
// Add other routes here...

// Basic root route (optional)
app.get('/', (req, res) => {
  res.send('Atlas V2 Server is running!');
});

// --- Server Start (Database schema managed by migrations) ---
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Optional: You could add a db.sequelize.authenticate() here to check connection
  // but migrations should handle the schema setup.
});

// Optional: Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.sequelize.close().then(() => {
        console.log('DB connection closed');
        process.exit(0);
    });
  });
});

module.exports = app; // Export for potential testing 