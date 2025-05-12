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
import ManagerNewInvoice from './pages/ManagerNewInvoice'; // Import the new page
import AddEmployee from './pages/ManagerAddEmployee'; // Import AddEmployee
import AddInventoryItem from './pages/AddInventoryItem'; // Import AddInventoryItem
import ManagerCompletedOrders from './pages/ManagerCompletedOrders'; // Import Completed Orders
import ManagerLoginPage from './pages/ManagerLoginPage'; // Import ManagerLoginPage
import ManagerSignUpPage from './pages/ManagerSignUpPage'; // Import SignUpPage
// import ManagerCustomers from './pages/ManagerCustomers'; // Add when created
// import ManagerSettings from './pages/ManagerSettings';   // Add when created

// We might not need a specific App.css anymore
// import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Set login page as the root path */}
        <Route path="/" element={<ManagerLoginPage />} />
        <Route path="/signup" element={<ManagerSignUpPage />} />
        
        {/* Manager Routes - Assuming these are protected and accessible after login */}
        <Route path="/orders" element={<ManagerActiveOrders />} />
        <Route path="/orders/new" element={<ManagerNewInvoice />} />
        <Route path="/orders/edit/:orderId" element={<ManagerNewInvoice />} />
        <Route path="/orders/completed" element={<ManagerCompletedOrders />} />
        <Route path="/totals" element={<ManagerTotals />} />
        <Route path="/employees" element={<ManagerEmployees />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/edit/:employeeId" element={<AddEmployee />} />
        <Route path="/inventory" element={<ManagerInventory />} />
        <Route path="/inventory/add" element={<AddInventoryItem />} />
        <Route path="/inventory/edit/:itemId" element={<AddInventoryItem />} />
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