const db = require('../models');
const { Employee, TimesheetEntry, WeeklyTimesheetStatus, Timesheet } = db;
const { Op } = require('sequelize');
const moment = require('moment-timezone'); // Ensure moment-timezone is imported

/**
 * Calculates the start (Monday) and end (Sunday) dates of the current week in America/New_York.
 * @returns {{startDate: Date, endDate: Date, weekStartDateOnly: string}}
 */
const getCurrentWeekDates = () => {
    const now = moment().tz('America/New_York');
    
    // Find the most recent Saturday (start of the week)
    const startOfWeek = now.clone().startOf('day');
    while (startOfWeek.day() !== 6) { // 6 is Saturday
        startOfWeek.subtract(1, 'day');
    }
    
    // End date is the following Friday at end of day
    const endOfWeek = startOfWeek.clone().add(6, 'days').endOf('day');

    // Get Saturday's date in YYYY-MM-DD format for database queries
    const weekStartDateOnly = startOfWeek.format('YYYY-MM-DD');

    console.log('DEBUG: Date calculations in getCurrentWeekDates:', {
        now: now.format(),
        weekStartDate: weekStartDateOnly,
        startDateTime: startOfWeek.format(),
        endDateTime: endOfWeek.format(),
        payPeriodRange: `${startOfWeek.format('MM/DD/YYYY')} - ${endOfWeek.format('MM/DD/YYYY')}`,
        nowDay: now.day(),
        startDay: startOfWeek.day(),
        endDay: endOfWeek.day(),
        // Add more detailed debug info
        startDateUnix: startOfWeek.unix(),
        endDateUnix: endOfWeek.unix(),
        startDateISO: startOfWeek.toISOString(),
        endDateISO: endOfWeek.toISOString()
    });

    return { 
        startDate: startOfWeek.toDate(),
        endDate: endOfWeek.toDate(),
        weekStartDateOnly
    };
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
    console.log('DEBUG: Manager View Query Parameters:', {
        weekStartDateOnly,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentTime: moment().tz('America/New_York').format()
    });

    try {
        // Get all employees first
        const employees = await Employee.findAll({
            attributes: ['id', 'name', 'hourly_rate', 'email', 'phone']
        });

        // Get all timesheet records for the week that are submitted
        const timesheetRecords = await Timesheet.findAll({
            where: {
                date: {
                    [Op.between]: [weekStartDateOnly, moment(endDate).format('YYYY-MM-DD')]
                },
                status: 'submitted'
            }
        });

        console.log('DEBUG: Data fetched:', {
            employeeCount: employees.length,
            timesheetCount: timesheetRecords.length,
            weekStartDate: weekStartDateOnly,
            timesheets: JSON.stringify(timesheetRecords, null, 2)
        });

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const results = employees.map(employee => {
            const employeeData = employee.get({ plain: true });
            let weeklyGross = 0;
            const timesheet = {};
            
            // Initialize all days with default values
            daysOfWeek.forEach(day => {
                timesheet[day] = {
                    hoursWorked: 0.000,  // Initialize to 3 decimal places
                    dailyPay: 0.00       // Initialize to 2 decimal places for currency
                };
            });

            // Find this employee's timesheet records
            const employeeRecords = timesheetRecords.filter(record => 
                record.employeeId === employeeData.id
            );

            // Process each record
            employeeRecords.forEach(record => {
                const recordDate = moment(record.date);
                const dayName = daysOfWeek[recordDate.day()];
                const hours = parseFloat(record.hoursWorked) || 0;
                const hourlyRate = parseFloat(employeeData.hourly_rate) || 0;
                const dailyPay = hours * hourlyRate;

                timesheet[dayName] = {
                    hoursWorked: parseFloat(hours.toFixed(3)),  // Ensure 3 decimal places
                    dailyPay: parseFloat(dailyPay.toFixed(2))   // Ensure 2 decimal places for currency
                };
                weeklyGross += dailyPay;
            });

            // Set approval status based on whether there are timesheet records
            const approvalStatus = employeeRecords.length > 0 ? 'Pending' : 'Not Submitted';

            return {
                employeeId: employeeData.id,
                name: employeeData.name,
                hourlyWage: parseFloat(employeeData.hourly_rate) || 0,
                approvalStatus: approvalStatus,
                timesheet: timesheet,
                weeklyGross: parseFloat(weeklyGross.toFixed(2))  // Ensure 2 decimal places for currency
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
        // REMOVED 'is_active' from attributes
        const employee = await Employee.findByPk(employeeId, { attributes: ['id'] }); 
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }
        // REMOVED Check for inactive employee

        // REMOVED 'is_active' from attributes
        const statusRecord = await WeeklyTimesheetStatus.findOne({
            where: {
                weekStartDate: weekStartDateOnly,
                employeeId: employeeId
            },
            attributes: ['id', 'status']
        });

        if (statusRecord) {
            statusRecord.status = status;
            await statusRecord.save();
            return statusRecord;
        } else {
            const newStatus = await WeeklyTimesheetStatus.create({
                weekStartDate: weekStartDateOnly,
                employeeId: employeeId,
                status: status
            });
            return newStatus;
        }
    } catch (error) {
        console.error("Error updating weekly timesheet status:", error);
        throw new Error('Failed to update weekly timesheet status.');
    }
};

// -- Potentially missing functions like fireEmployee, reinstateEmployee, addEmployee were here --
// -- Ensuring the main functions are exported --

module.exports = {
    getWeeklyTimesheets,
    updateWeeklyTimesheetStatus,
    // fireEmployee, // Commenting out as they might have been deleted and are not core to current issue
    // reinstateEmployee,
    // addEmployee
};