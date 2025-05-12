import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeOrders from './components/employee/EmployeeOrders';
import EmployeeInventory from './components/employee/EmployeeInventory';
import Timesheet from './components/employee/Timesheet';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeSignUpPage from './pages/EmployeeSignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeLoginPage />} />
        <Route path="/signup" element={<EmployeeSignUpPage />} />
        
        {/* Employee routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="timesheet" replace />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="orders" element={<EmployeeOrders />} />
          <Route path="inventory" element={<EmployeeInventory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 