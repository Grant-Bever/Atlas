import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate // To redirect the base path
} from 'react-router-dom';

// Import Manager Pages
import ManagerActiveOrders from './pages/ManagerActiveOrders';
import ManagerEmployees from './pages/ManagerEmployees';   
import ManagerInventory from './pages/ManagerInventory';  
import ManagerTotals from './pages/ManagerTotals';
// import ManagerCustomers from './pages/ManagerCustomers'; // Add when created
// import ManagerSettings from './pages/ManagerSettings';   // Add when created

// We might not need a specific App.css anymore
// import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Manager Routes - Assuming these are the main routes for now */}
        {/* Redirect base path "/" to "/orders" by default */}
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/orders" element={<ManagerActiveOrders />} />
        <Route path="/totals" element={<ManagerTotals />} />
        <Route path="/employees" element={<ManagerEmployees />} />
        <Route path="/inventory" element={<ManagerInventory />} />
        {/* Add routes for Customers and Settings when components are ready
        <Route path="/customers" element={<ManagerCustomers />} />
        <Route path="/settings" element={<ManagerSettings />} />
        */}

        {/* TODO: Add routes for Employee and Customer roles later */}

        {/* Optional: Add a 404 Not Found Route */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App; 