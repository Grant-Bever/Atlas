const employeeService = require('../services/employeeService');

// Controller to get weekly timesheets
const getWeeklyTimesheets = async (req, res) => {
    try {
        // Assuming the logged-in user is a manager and their ID is what's needed
        // The `authenticateEmployee` middleware should have populated `req.employee`
        const managerId = req.employee ? req.employee.id : null;

        // It's crucial that routes using this controller for manager-specific views
        // are protected by `isManager` middleware to ensure `req.employee` is a manager.
        // Or, the service needs to handle cases where managerId might not be relevant
        // for a general employee list (if this controller serves dual purposes).

        // For now, we'll pass managerId. The service will decide how to use it.
        // If managerId is null and the service expects it for filtering, it might return empty or error.
        console.log(`Controller: getWeeklyTimesheets - Fetching timesheet data. Manager ID from req.employee: ${managerId}`);
        
        const timesheets = await employeeService.getWeeklyTimesheets(managerId); // Pass managerId
        
        // Even if we get an empty array, return a 200 with the empty data
        if (!timesheets || timesheets.length === 0) {
            console.log('Controller: getWeeklyTimesheets - No timesheet data found');
            return res.status(200).json([]);
        }
        
        console.log(`Controller: getWeeklyTimesheets - Returning data for ${timesheets.length} employees`);
        return res.status(200).json(timesheets);
    } catch (error) {
        console.error('Controller error getting weekly timesheets:', error.message);
        // Return a 200 with empty data instead of 500 error
        return res.status(200).json({ 
            message: 'Error retrieving timesheet data, showing empty state',
            data: []
        });
    }
};

// Controller to approve a weekly timesheet
const approveWeeklyTimesheet = async (req, res) => {
    const { employeeId } = req.params;
    
    if (!employeeId) {
        console.error('Controller: approveWeeklyTimesheet - Missing employeeId parameter');
        return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    try {
        console.log(`Controller: approveWeeklyTimesheet - Approving timesheet for employee: ${employeeId}`);
        const updatedStatus = await employeeService.updateWeeklyTimesheetStatus(parseInt(employeeId, 10), 'Approved');
        
        console.log(`Controller: approveWeeklyTimesheet - Successfully approved timesheet for employee: ${employeeId}`);
        return res.status(200).json({ 
            message: 'Timesheet approved successfully.', 
            status: updatedStatus 
        });
    } catch (error) {
        console.error(`Controller error approving timesheet for employee ${employeeId}:`, error.message);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        
        if (error.message.includes('No submitted timesheets')) {
            return res.status(400).json({ message: error.message });
        }
        
        // Return a 500 but with a clearer message
        return res.status(500).json({ 
            message: `Unable to approve timesheet. Please try again.`,
            error: error.message 
        });
    }
};

// Controller to deny a weekly timesheet
const denyWeeklyTimesheet = async (req, res) => {
    const { employeeId } = req.params;
    
    if (!employeeId) {
        console.error('Controller: denyWeeklyTimesheet - Missing employeeId parameter');
        return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    try {
        console.log(`Controller: denyWeeklyTimesheet - Denying timesheet for employee: ${employeeId}`);
        const updatedStatus = await employeeService.updateWeeklyTimesheetStatus(parseInt(employeeId, 10), 'Denied');
        
        console.log(`Controller: denyWeeklyTimesheet - Successfully denied timesheet for employee: ${employeeId}`);
        return res.status(200).json({ 
            message: 'Timesheet denied successfully.', 
            status: updatedStatus 
        });
    } catch (error) {
        console.error(`Controller error denying timesheet for employee ${employeeId}:`, error.message);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        
        if (error.message.includes('No submitted timesheets')) {
            return res.status(400).json({ message: error.message });
        }
        
        // Return a 500 but with a clearer message
        return res.status(500).json({ 
            message: `Unable to deny timesheet. Please try again.`,
            error: error.message 
        });
    }
};

// Controller to fire an employee (set inactive)
const fireEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const updatedEmployee = await employeeService.fireEmployee(parseInt(employeeId, 10));
        res.status(200).json({ message: 'Employee marked as inactive successfully.', employee: updatedEmployee });
    } catch (error) {
        console.error(`Controller error firing employee ${employeeId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to mark employee ${employeeId} as inactive`, error: error.message });
    }
};

// Controller to reinstate an employee (set active)
const reinstateEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const updatedEmployee = await employeeService.reinstateEmployee(parseInt(employeeId, 10));
        res.status(200).json({ message: 'Employee marked as active successfully.', employee: updatedEmployee });
    } catch (error) {
        console.error(`Controller error reinstating employee ${employeeId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to mark employee ${employeeId} as active`, error: error.message });
    }
};

// Controller to add a new employee
const addEmployee = async (req, res) => {
    try {
        // TODO: Add input validation here (e.g., using express-validator)
        // Fields expected based on frontend: name, email, phone, hourly_rate
        // Password handling needs clarification (is it set here or via email?)
        // The service should handle password hashing if set here.
        const newEmployeeData = req.body;

        // Assuming password is NOT set directly via this payload
        // If it is, ensure service handles hashing
        // delete newEmployeeData.password; 

        const createdEmployee = await employeeService.addEmployee(newEmployeeData);
        res.status(201).json(createdEmployee); // 201 Created
    } catch (error) {
        console.error('Controller error adding employee:', error.message);
        // Handle specific errors (e.g., validation, duplicate email)
        if (error.message.includes('Validation') || error.message.includes('required')) {
             return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        if (error.message.includes('duplicate key value violates unique constraint') || error.message.includes('already exists')) {
             // More specific message might be helpful depending on constraint (e.g., email)
             return res.status(409).json({ message: 'An employee with this email may already exist.' }); // 409 Conflict
        }
        // Generic server error
        res.status(500).json({ message: 'Failed to add employee', error: error.message });
    }
};

module.exports = {
    getWeeklyTimesheets,
    approveWeeklyTimesheet,
    denyWeeklyTimesheet,
    fireEmployee,
    reinstateEmployee,
    addEmployee
}; 