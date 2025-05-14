import React from 'react';
import {
  BrowserRouter as Router,
  Switch,  // Changed from Routes
  Route,
  Redirect // Changed from Navigate
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
      <Switch> {/* Changed from Routes */}
        {/* Set login page as the root path */}
        <Route exact path="/" component={ManagerLoginPage} /> {/* Changed element to component and added exact */}
        <Route exact path="/signup" component={ManagerSignUpPage} /> {/* Changed element to component and added exact */}
        
        {/* Manager Routes - Assuming these are protected and accessible after login */}
        <Route exact path="/orders" component={ManagerActiveOrders} /> {/* Changed element to component and added exact */}
        <Route exact path="/orders/new" component={ManagerNewInvoice} /> {/* Changed element to component and added exact */}
        <Route exact path="/orders/edit/:orderId" component={ManagerNewInvoice} /> {/* Changed element to component and added exact */}
        <Route exact path="/orders/completed" component={ManagerCompletedOrders} /> {/* Changed element to component and added exact */}
        <Route exact path="/totals" component={ManagerTotals} /> {/* Changed element to component and added exact */}
        <Route exact path="/employees" component={ManagerEmployees} /> {/* Changed element to component and added exact */}
        <Route exact path="/employees/add" component={AddEmployee} /> {/* Changed element to component and added exact */}
        <Route exact path="/employees/edit/:employeeId" component={AddEmployee} /> {/* Changed element to component and added exact */}
        <Route exact path="/inventory" component={ManagerInventory} /> {/* Changed element to component and added exact */}
        <Route exact path="/inventory/add" component={AddInventoryItem} /> {/* Changed element to component and added exact */}
        <Route exact path="/inventory/edit/:itemId" component={AddInventoryItem} /> {/* Changed element to component and added exact */}
        {/* Add routes for Customers and Settings when components are ready
        <Route exact path="/customers" component={ManagerCustomers} />
        <Route exact path="/settings" component={ManagerSettings} />
        */}

        {/* TODO: Add routes for Employee and Customer roles later */}

        {/* Optional: Add a 404 Not Found Route - In v5, a Redirect can be used at the end of a Switch for no match */}
        {/* <Route path="*"><div>404 Not Found</div></Route> is one way or <Redirect to="/" /> for example */}
        {/* For a generic 404, you can add a Route without a path at the end of the Switch: */}
        {/* <Route render={() => <div>404 Not Found</div>} /> */}
      </Switch>
    </Router>
  );
}

export default App; 