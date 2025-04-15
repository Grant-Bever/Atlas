const db = require('../models');
const { Employee, TimesheetEntry, WeeklyTimesheetStatus } = db;
const { Op } = require('sequelize');

/**
 * Calculates the start (Monday) and end (Sunday) dates of the current week.
 * @returns {{startDate: Date, endDate: Date, weekStartDateOnly: string}}
 */
const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const diffToSunday = currentDay === 0 ? 0 : 7 - currentDay;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0); // Start of Monday

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + diffToSunday);
    endDate.setHours(23, 59, 59, 999); // End of Sunday

    // Get Monday's date in YYYY-MM-DD format for status lookup
    const weekStartDateOnly = startDate.toISOString().split('T')[0];

    return { startDate, endDate, weekStartDateOnly };
};

/**
 * Calculates hours between two dates.
 * @param {Date} clockIn
 * @param {Date} clockOut
 * @returns {number} Hours worked
 */
const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const diffMs = clockOut.getTime() - clockIn.getTime();
    return diffMs / (1000 * 60 * 60);
};

/**
 * Fetches employee timesheet data for the current week.
 * Includes both active and inactive employees if they have entries for the week.
 * @returns {Promise<Array<object>>}
 */
const getWeeklyTimesheets = async () => {
    const { startDate, endDate, weekStartDateOnly } = getCurrentWeekDates();
    console.log(`Fetching timesheets for week starting: ${weekStartDateOnly}`);

    try {
        const employeesWithEntries = await Employee.findAll({
            // Include is_active status
            attributes: ['id', 'name', 'hourly_rate', 'email', 'phone', 'is_active', 'fired_at'], 
            include: [
                {
                    model: TimesheetEntry,
                    as: 'timesheetEntries',
                    required: true, // Still require entries for the period
                    where: {
                        clockInTime: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    attributes: ['id', 'clockInTime', 'clockOutTime']
                },
                {
                    model: WeeklyTimesheetStatus,
                    as: 'weeklyStatuses',
                    required: false,
                    where: { weekStartDate: weekStartDateOnly },
                    attributes: ['status']
                }
            ],
            // No longer filtering by employee status here
            order: [['name', 'ASC']]
        });

        // Process the data (similar processing, just add isActive)
        const results = employeesWithEntries.map(employee => {
            const employeeData = employee.get({ plain: true });
            let weeklyGross = 0;
            const timesheet = {};
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            daysOfWeek.forEach(day => { timesheet[day] = { clockIn: null, clockOut: null, hours: 0, dailyPay: 0 }; });

            employeeData.timesheetEntries.forEach(entry => {
                const clockIn = entry.clockInTime ? new Date(entry.clockInTime) : null;
                const clockOut = entry.clockOutTime ? new Date(entry.clockOutTime) : null;
                if (!clockIn) return;

                const dayIndex = clockIn.getDay() === 0 ? 6 : clockIn.getDay() - 1;
                const dayName = daysOfWeek[dayIndex];

                const hours = calculateHours(clockIn, clockOut);
                const dailyPay = hours * (parseFloat(employeeData.hourly_rate) || 0);

                timesheet[dayName] = {
                    clockIn: clockIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    clockOut: clockOut ? clockOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
                    hours: hours,
                    dailyPay: dailyPay
                };
                weeklyGross += dailyPay;
            });

            const statusRecord = employeeData.weeklyStatuses && employeeData.weeklyStatuses.length > 0
                                ? employeeData.weeklyStatuses[0]
                                : null;
            const approvalStatus = statusRecord ? statusRecord.status : 'Pending';

            return {
                employeeId: employeeData.id,
                name: employeeData.name,
                hourlyWage: parseFloat(employeeData.hourly_rate) || 0,
                isActive: employeeData.is_active, // Include active status
                firedAt: employeeData.fired_at, // Include fired timestamp
                approvalStatus: approvalStatus,
                timesheet: timesheet,
                weeklyGross: weeklyGross
            };
        });

        return results;

    } catch (error) {
        console.error("Error fetching weekly timesheets:", error);
        throw new Error('Failed to fetch weekly timesheets.');
    }
};

/**
 * Updates the status of a weekly timesheet for an employee.
 * @param {number} employeeId
 * @param {string} status - 'Approved' or 'Denied'
 * @returns {Promise<object>} The updated or created status record.
 */
const updateWeeklyTimesheetStatus = async (employeeId, status) => {
    const { weekStartDateOnly } = getCurrentWeekDates();

    if (!['Approved', 'Denied'].includes(status)) {
        throw new Error('Invalid status provided.');
    }

    try {
        const employee = await Employee.findByPk(employeeId, { attributes: ['id', 'is_active'] }); // Check if active
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }
        // Optional: Prevent approving/denying fired employees? Or allow it?
        // if (!employee.is_active) {
        //     throw new Error(`Cannot update timesheet status for inactive employee ${employeeId}.`);
        // }

        const [statusRecord, created] = await WeeklyTimesheetStatus.findOrCreate({
            where: {
                employee_id: employeeId,
                weekStartDate: weekStartDateOnly
            },
            defaults: {
                status: status
            }
        });

        if (!created && statusRecord.status !== status) {
            statusRecord.status = status;
            await statusRecord.save();
        }

        console.log(`Timesheet status for employee ${employeeId}, week ${weekStartDateOnly} set to ${status}. Created: ${created}`);
        return statusRecord;

    } catch (error) {
        console.error(`Error updating timesheet status for employee ${employeeId}:`, error);
        throw new Error(`Failed to update timesheet status for employee ${employeeId}.`);
    }
};

/**
 * Marks an employee as inactive (fired).
 * @param {number} employeeId
 * @returns {Promise<Employee>} The updated employee record.
 */
const fireEmployee = async (employeeId) => {
    try {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }
        if (!employee.is_active) {
            console.log(`Employee ${employeeId} is already inactive.`);
            return employee; // Or throw error if preferred
        }

        employee.is_active = false;
        employee.fired_at = new Date(); // Record the time of firing
        await employee.save();

        console.log(`Employee ${employeeId} marked as inactive (fired) at ${employee.fired_at}.`);
        return employee;
    } catch (error) {
        console.error(`Error firing employee ${employeeId}:`, error);
        throw new Error(`Failed to fire employee ${employeeId}.`);
    }
};

/**
 * Marks an employee as active (reinstated).
 * @param {number} employeeId
 * @returns {Promise<Employee>} The updated employee record.
 */
const reinstateEmployee = async (employeeId) => {
    try {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }
        if (employee.is_active) {
            console.log(`Employee ${employeeId} is already active.`);
            return employee; // Or throw error if preferred
        }

        employee.is_active = true;
        employee.fired_at = null; // Clear the firing timestamp
        await employee.save();

        console.log(`Employee ${employeeId} marked as active (reinstated).`);
        return employee;
    } catch (error) {
        console.error(`Error reinstating employee ${employeeId}:`, error);
        throw new Error(`Failed to reinstate employee ${employeeId}.`);
    }
};

module.exports = {
    getWeeklyTimesheets,
    updateWeeklyTimesheetStatus,
    fireEmployee,         // Export new function
    reinstateEmployee     // Export new function
}; 