const employeeService = require('../services/employeeService');

// Controller to get weekly timesheets
const getWeeklyTimesheets = async (req, res) => {
    try {
        const timesheets = await employeeService.getWeeklyTimesheets();
        res.status(200).json(timesheets);
    } catch (error) {
        console.error('Controller error getting weekly timesheets:', error.message);
        res.status(500).json({ message: 'Failed to retrieve weekly timesheets', error: error.message });
    }
};

// Controller to approve a weekly timesheet
const approveWeeklyTimesheet = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const updatedStatus = await employeeService.updateWeeklyTimesheetStatus(parseInt(employeeId, 10), 'Approved');
        res.status(200).json({ message: 'Timesheet approved successfully.', status: updatedStatus });
    } catch (error) {
        console.error(`Controller error approving timesheet for employee ${employeeId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to approve timesheet for employee ${employeeId}`, error: error.message });
    }
};

// Controller to deny a weekly timesheet
const denyWeeklyTimesheet = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const updatedStatus = await employeeService.updateWeeklyTimesheetStatus(parseInt(employeeId, 10), 'Denied');
        res.status(200).json({ message: 'Timesheet denied successfully.', status: updatedStatus });
    } catch (error) {
        console.error(`Controller error denying timesheet for employee ${employeeId}:`, error.message);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: `Failed to deny timesheet for employee ${employeeId}`, error: error.message });
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