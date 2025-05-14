const path = require('path'); // Moved up
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load environment variables first
const express = require('express');
const cors = require('cors');
// const path = require('path'); // Original position, now removed as it's moved up
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

// Define allowed origins
const allowedOrigins = [
  'https://manager-client-671804272646.us-east1.run.app',
  'https://customer-client-671804272646.us-east1.run.app',
  'https://employee-client-671804272646.us-east1.run.app'
];

// In development, also allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002');
}

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Allow cookies
}));

app.use(express.json()); // Parse incoming request bodies in JSON format
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Verify environment variables for database connection (moved down, after dotenv config)
const { DB_NAME, DB_USER, DB_PASS, DB_HOST, NODE_ENV } = process.env;

if (!DB_NAME || !DB_USER || !DB_HOST) { // Removed DB_PASS from this direct check for a moment
    console.error("CRITICAL: Database configuration environment variables (DB_NAME, DB_USER, DB_HOST) must all be set.");
    // process.exit(1); // Potentially re-enable exit later
}
console.log(`DB_NAME: ${DB_NAME}`);
console.log(`DB_USER: ${DB_USER}`);
// console.log(`DB_PASS is set: ${!!DB_PASS}`); // Original check for DB_PASS
console.log(`DB_PASS from env is set: ${!!process.env.DB_PASS}`); // More direct check post-config
console.log(`DB_HOST (socket path): ${DB_HOST}`);
console.log(`NODE_ENV: ${NODE_ENV}`);

// Test DB connection
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        // Sync models (optional, based on your setup)
        // return db.sequelize.sync(); // Example: { force: true } for development to drop/recreate
        return db.sequelize.sync({ alter: true }); // Safely alter tables
    })
    .then(() => {
        console.log("All models were synchronized successfully.");
    })
    .catch(err => {
        console.error('Unable to connect to the database or sync models:', err);
        if (!DB_PASS) {
            console.error("DB_PASS is missing from environment variables. Please check your .env file and dotenv configuration.");
        }
        // process.exit(1); // Consider exiting if DB connection is critical for startup
    });

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