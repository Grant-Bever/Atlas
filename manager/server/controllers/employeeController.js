const employeeService = require('../services/employeeService');

// Controller to get weekly timesheets
const getWeeklyTimesheets = async (req, res) => {
    try {
        // The route is now protected by `authenticateManager`, which populates `req.manager`
        const managerId = req.manager ? req.manager.id : null;

        if (!managerId) {
            // This case should ideally not be reached if authenticateManager is working correctly
            // and requires a manager to be logged in.
            console.error('Controller: getWeeklyTimesheets - managerId is null. req.manager:', req.manager);
            return res.status(401).json({ message: 'Manager authentication failed or manager ID not found.' });
        }

        console.log(`Controller: getWeeklyTimesheets - Fetching timesheet data for Manager ID: ${managerId}`);
        
        const timesheets = await employeeService.getWeeklyTimesheets(managerId);
        
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
        const newEmployeeData = req.body;

        // Ensure the manager creating the employee is assigned as their manager
        if (!req.manager || !req.manager.id) {
            console.error('Controller: addEmployee - Manager ID not found in request. This should not happen if authenticateManager is working.');
            return res.status(401).json({ message: 'Manager authentication failed or manager ID not found.' });
        }
        newEmployeeData.managerId = req.manager.id;

        // Assuming password is NOT set directly via this payload for initial creation
        // If password needs to be set, ensure service handles hashing.
        // It's common to have a separate flow for password setup (e.g., email invite).

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