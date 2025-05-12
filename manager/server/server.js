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

// --- Database Synchronization and Server Start ---
const PORT = process.env.PORT || 3002; // Use port from environment or default to 3002

// Sync database (optional: use { force: true } to drop and recreate tables - USE WITH CAUTION)
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync database:', err);
    process.exit(1); // Exit if DB sync fails
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