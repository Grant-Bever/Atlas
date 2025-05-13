const db = require('../models');
const { Employee, TimesheetEntry, WeeklyTimesheetStatus, Timesheet, TimesheetNotification } = db;
const { Op } = require('sequelize');
const moment = require('moment-timezone'); // Ensure moment-timezone is imported
const { sequelize } = require('../config/database');

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
            attributes: ['id', 'name', 'hourly_rate', 'email', 'encrypted_phone_number']
        });

        console.log(`DEBUG: Found ${employees.length} employees`);

        // Get all timesheet records for the week (not just submitted ones)
        const timesheetRecords = await Timesheet.findAll({
            where: {
                date: {
                    [Op.between]: [weekStartDateOnly, moment(endDate).format('YYYY-MM-DD')]
                }
            }
        });

        console.log(`DEBUG: Found ${timesheetRecords.length} timesheet records for the week`);

        // Get weekly status records
        const weeklyStatuses = await WeeklyTimesheetStatus.findAll({
            where: {
                weekStartDate: weekStartDateOnly
            }
        });

        console.log(`DEBUG: Found ${weeklyStatuses.length} weekly status records`);

        // Use fixed days of week array - aligned with moment.js day() function (0=Sunday, 6=Saturday)
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const results = employees.map(employee => {
            const employeeData = employee.get({ plain: true });
            let weeklyGross = 0;
            const timesheet = {};
            
            // Initialize all days with default values
            daysOfWeek.forEach(day => {
                timesheet[day] = {
                    hoursWorked: 0.000,
                    dailyPay: 0.00
                };
            });

            try {
                // Find this employee's timesheet records
                const employeeRecords = timesheetRecords.filter(record => 
                    record.employeeId === employeeData.id
                );

                // Find weekly status for this employee
                const weeklyStatus = weeklyStatuses.find(status => 
                    status.employeeId === employeeData.id
                );

                // Process each record
                employeeRecords.forEach(record => {
                    try {
                        const recordDate = moment(record.date);
                        if (!recordDate.isValid()) {
                            console.error(`Invalid date format for record: ${record.date}`);
                            return; // Skip this record
                        }

                        const dayName = daysOfWeek[recordDate.day()];
                        if (!dayName) {
                            console.error(`Invalid day index: ${recordDate.day()} for date: ${record.date}`);
                            return; // Skip this record
                        }

                        const hours = parseFloat(record.hoursWorked) || 0;
                        const hourlyRate = parseFloat(employeeData.hourly_rate) || 0;
                        const dailyPay = hours * hourlyRate;

                        timesheet[dayName] = {
                            hoursWorked: parseFloat(hours.toFixed(3)),
                            dailyPay: parseFloat(dailyPay.toFixed(2))
                        };
                        weeklyGross += dailyPay;
                    } catch (recordError) {
                        console.error(`Error processing timesheet record for employee ${employeeData.id}:`, recordError);
                        // Continue with other records
                    }
                });

                // Set approval status based on weekly status record or timesheet records
                let approvalStatus = 'Not Submitted';
                if (weeklyStatus) {
                    approvalStatus = weeklyStatus.status;
                } else if (employeeRecords.length > 0) {
                    if (employeeRecords.every(record => record.status === 'approved')) {
                        approvalStatus = 'Approved';
                    } else if (employeeRecords.every(record => record.status === 'denied')) {
                        approvalStatus = 'Denied';
                    } else if (employeeRecords.some(record => record.status === 'submitted')) {
                        approvalStatus = 'Pending';
                    }
                }

                return {
                    employeeId: employeeData.id,
                    name: employeeData.name,
                    hourlyWage: parseFloat(employeeData.hourly_rate) || 0,
                    approvalStatus: approvalStatus,
                    timesheet: timesheet,
                    weeklyGross: parseFloat(weeklyGross.toFixed(2)),
                    isActive: employeeData.is_active !== false // Default to true if not explicitly false
                };
            } catch (employeeError) {
                console.error(`Error processing timesheet data for employee ${employeeData.id}:`, employeeError);
                // Return employee with empty/default data rather than failing the entire response
                return {
                    employeeId: employeeData.id,
                    name: employeeData.name,
                    hourlyWage: parseFloat(employeeData.hourly_rate) || 0,
                    approvalStatus: 'Error',
                    timesheet: timesheet,
                    weeklyGross: 0,
                    isActive: employeeData.is_active !== false,
                    error: 'Failed to process timesheet data'
                };
            }
        });

        console.log(`DEBUG: Returning timesheet data for ${results.length} employees`);
        return results;

    } catch (error) {
        console.error("Error fetching weekly timesheets:", error);
        // Return empty array rather than throwing and causing 500 error
        return [];
    }
};

/**
 * Updates the status of a weekly timesheet for an employee.
 * @param {number} employeeId
 * @param {string} status - 'Approved' or 'Denied'
 * @returns {Promise<object>} The updated or created status record.
 */
const updateWeeklyTimesheetStatus = async (employeeId, status) => {
    const { startDate, endDate, weekStartDateOnly } = getCurrentWeekDates();

    if (!['Approved', 'Denied'].includes(status)) {
        throw new Error('Invalid status provided.');
    }

    try {
        // Find the employee
        const employee = await Employee.findByPk(employeeId, { attributes: ['id'] }); 
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }

        // Start a transaction to ensure all updates succeed or fail together
        const result = await sequelize.transaction(async (t) => {
            // Update all timesheet records for the week
            const timesheets = await Timesheet.findAll({
                where: {
                    employeeId,
                    date: {
                        [Op.between]: [weekStartDateOnly, moment(endDate).format('YYYY-MM-DD')]
                    },
                    status: 'submitted' // Only update submitted timesheets
                },
                transaction: t
            });

            if (timesheets.length === 0) {
                throw new Error('No submitted timesheets found for this week');
            }

            // Update all timesheet records
            await Promise.all(timesheets.map(async (timesheet) => {
                await timesheet.update({
                    status: status.toLowerCase(),
                    reviewedAt: new Date()
                }, { transaction: t });

                // Create notification for the employee
                await TimesheetNotification.create({
                    employeeId,
                    timesheetId: timesheet.id,
                    type: status.toLowerCase() === 'approved' ? 'approval' : 'denial',
                    message: `Your timesheet for ${timesheet.date} has been ${status.toLowerCase()}.`,
                }, { transaction: t });
            }));

            // Always update the weekly status record
            await WeeklyTimesheetStatus.upsert({
                employeeId,
                weekStartDate: weekStartDateOnly,
                status: status
            }, { transaction: t });

            // Fetch and return the updated status
            return await WeeklyTimesheetStatus.findOne({
                where: {
                    employeeId,
                    weekStartDate: weekStartDateOnly
                },
                transaction: t
            });
        });

        return result;
    } catch (error) {
        console.error('Error in updateWeeklyTimesheetStatus:', error);
        throw error;
    }
};

// -- Potentially missing functions like fireEmployee, reinstateEmployee, addEmployee were here --
// -- Ensuring the main functions are exported --

module.exports = {
    getWeeklyTimesheets,
    updateWeeklyTimesheetStatus,
    getCurrentWeekDates
};