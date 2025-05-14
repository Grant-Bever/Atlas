import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeOrders from './components/employee/EmployeeOrders';
import EmployeeInventory from './components/employee/EmployeeInventory';
import Timesheet from './components/employee/Timesheet';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeeSignUpPage from './pages/EmployeeSignUpPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={EmployeeLoginPage} />
        <Route exact path="/signup" component={EmployeeSignUpPage} />
        
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