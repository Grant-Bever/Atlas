import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
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
        {/* Employee routes - In v5, nested routes are defined differently or handled within the parent component */}
        {/* For layouts in v5, often the layout route is defined, and it handles its own child routes */}
        <Route path="/employee" render={(props) => (
          <EmployeeLayout {...props}>
            <Switch>
              <Route exact path={`${props.match.path}/timesheet`} component={Timesheet} />
              <Route exact path={`${props.match.path}/orders`} component={EmployeeOrders} />
              <Route exact path={`${props.match.path}/inventory`} component={EmployeeInventory} />
              {/* Redirect from /employee to /employee/timesheet */}
              <Redirect exact from={`${props.match.path}`} to={`${props.match.path}/timesheet`} />
            </Switch>
          </EmployeeLayout>
        )} />
      </Switch>
    </Router>
  );
}

export default App; 