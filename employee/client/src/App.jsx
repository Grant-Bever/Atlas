import { BrowserRouter as Router, Switch, Route, Navigate } from 'react-router-dom';
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeOrders from './components/employee/EmployeeOrders';
import EmployeeInventory from './components/employee/EmployeeInventory';
import Timesheet from './components/employee/Timesheet';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeSignUpPage from './pages/EmployeeSignUpPage';
import PaymentPage from './pages/PaymentPage';
import StripeTest from './pages/StripeTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<EmployeeLoginPage />} />
        <Route path="/signup" element={<EmployeeSignUpPage />} />

        
        {/* Employee routes - protected by authentication in EmployeeLayout */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="timesheet" replace />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="orders" element={<EmployeeOrders />} />
          <Route path="inventory" element={<EmployeeInventory />} />
        </Route>
        
        {/* Catch any unmatched routes and redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 