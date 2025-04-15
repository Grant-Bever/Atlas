const db = require('../models');
const { Invoice, Customer } = db;
const { Op } = require('sequelize');

/**
 * Calculates the start (Monday) and end (Sunday) dates of the current week.
 * @returns {{startDate: Date, endDate: Date}}
 */
const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust Sunday
    const diffToSunday = currentDay === 0 ? 0 : 7 - currentDay;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0); // Start of Monday

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + diffToSunday);
    endDate.setHours(23, 59, 59, 999); // End of Sunday

    return { startDate, endDate };
};

/**
 * Fetches and calculates weekly totals per customer for the current week (Mon-Sun).
 * @returns {Promise<Array<object>>} Array of customer totals: [{ customerId, customerName, dailyTotals: [Mon, Tue,...Sun] }, ...]
 */
const getWeeklyTotals = async () => {
    const { startDate, endDate } = getCurrentWeekDates();
    console.log(`Fetching totals for week: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    try {
        const invoices = await Invoice.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                },
                // Optionally filter out non-completed/paid invoices if needed
                // completed: true, 
            },
            include: [{
                model: Customer,
                as: 'customer',
                attributes: ['id', 'name'], // Only fetch needed customer fields
                required: true // Ensure only invoices with customers are included
            }],
            attributes: ['date', 'total', 'customer_id'], // Only fetch needed invoice fields
            raw: true, // Get plain data objects
            nest: true // Nest the included customer data
        });

        // Process invoices to aggregate totals
        const customerTotals = {};

        for (const invoice of invoices) {
            const customerId = invoice.customer.id;
            const customerName = invoice.customer.name;
            const invoiceDate = new Date(invoice.date);
            const dayOfWeek = invoiceDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
            const totalAmount = parseFloat(invoice.total) || 0;

            // Adjust day index: Monday = 0, ..., Sunday = 6
            const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            if (!customerTotals[customerId]) {
                customerTotals[customerId] = {
                    customerId: customerId,
                    customerName: customerName,
                    dailyTotals: Array(7).fill(0) // Initialize Mon-Sun array
                };
            }

            customerTotals[customerId].dailyTotals[adjustedDayIndex] += totalAmount;
        }

        // Convert the aggregated object into an array
        return Object.values(customerTotals);

    } catch (error) {
        console.error("Error fetching weekly totals:", error);
        throw new Error('Failed to fetch weekly totals.');
    }
};

module.exports = {
    getWeeklyTotals
}; 