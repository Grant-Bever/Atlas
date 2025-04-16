require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const http = require('http'); // Import http module
const { Server } = require("socket.io"); // Import Socket.IO Server
const { initializeSocket } = require('./socketManager'); // Correctly destructure the import

const db = require('./models'); // Imports models/index.js - initializes Sequelize

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const totalsRoutes = require('./routes/totalsRoutes'); // <-- Add totals routes
const employeeRoutes = require('./routes/employeeRoutes'); // <-- Import employee routes
const inventoryRoutes = require('./routes/inventoryRoutes'); // <-- Import inventory routes
const customerRoutes = require('./routes/customerRoutes');
// Add other route imports here as you create them (e.g., inventoryRoutes)

const app = express();
// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer); // Pass server to initializer

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow manager client origin
app.use(express.json()); // Parse incoming request bodies in JSON format
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Mount Routes ---
app.use('/api/orders', orderRoutes);
app.use('/api/totals', totalsRoutes); // <-- Mount totals routes
app.use('/api/employees', employeeRoutes); // <-- Mount employee routes
app.use('/api/inventory', inventoryRoutes); // <-- Mount inventory routes
app.use('/api/customer', customerRoutes);
// app.use('/api/inventory', inventoryRoutes); // Example for other routes
// Add other routes here...

// Basic root route (optional)
app.get('/', (req, res) => {
  res.send('Atlas V2 Server with Socket.IO is running!');
});

// Socket.IO connection handling (basic example)
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  // Add specific event listeners for this socket if needed

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Database Synchronization and Server Start ---
const PORT = process.env.PORT || 3002; // Use port from environment or default to 3002

// Sync database (optional: use { force: true } to drop and recreate tables - USE WITH CAUTION)
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
    // Start the HTTP server (which includes Socket.IO) instead of app.listen
    httpServer.listen(PORT, () => {
      console.log(`Server with Socket.IO listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync database:', err);
    process.exit(1); // Exit if DB sync fails
  });

// Optional: Graceful shutdown handling for httpServer
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  // Use httpServer for closing
  httpServer.close(() => {
    console.log('HTTP server closed');
    io.close(() => { // Close Socket.IO connections
      console.log('Socket.IO closed');
      db.sequelize.close().then(() => {
        console.log('DB connection closed');
        process.exit(0);
      });
    });
  });
});

// Export httpServer if needed for testing, or app/io individually
module.exports = { app, httpServer, io }; 