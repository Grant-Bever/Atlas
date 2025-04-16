const express = require('express');
const router = express.Router();
const { Timesheet, TimesheetNotification, Employee } = require('../models');
const { authenticateEmployee } = require('../middleware/auth');

// Submit timesheet for approval
router.post('/submit', authenticateEmployee, async (req, res) => {
  try {
    const { timesheetId } = req.body;
    const employeeId = req.employee.id;

    const timesheet = await Timesheet.findOne({
      where: { id: timesheetId, employeeId }
    });

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    await timesheet.update({
      status: 'submitted',
      submissionCount: timesheet.submissionCount + 1
    });

    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting timesheet', error: error.message });
  }
});

// Approve timesheet (manager only)
router.put('/approve/:id', authenticateEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.employee.id;

    // Verify manager role
    if (!req.employee.isManager) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    await timesheet.update({
      status: 'approved',
      reviewedBy: managerId,
      reviewedAt: new Date()
    });

    // Create approval notification
    await TimesheetNotification.create({
      employeeId: timesheet.employeeId,
      timesheetId: timesheet.id,
      type: 'approval',
      message: 'Your timesheet has been approved'
    });

    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: 'Error approving timesheet', error: error.message });
  }
});

// Deny timesheet (manager only)
router.put('/deny/:id', authenticateEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const managerId = req.employee.id;

    if (!req.employee.isManager) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    await timesheet.update({
      status: 'denied',
      managerFeedback: feedback,
      reviewedBy: managerId,
      reviewedAt: new Date()
    });

    // Create denial notification
    await TimesheetNotification.create({
      employeeId: timesheet.employeeId,
      timesheetId: timesheet.id,
      type: 'denial',
      message: `Your timesheet has been denied. Feedback: ${feedback}`
    });

    res.json(timesheet);
  } catch (error) {
    res.status(500).json({ message: 'Error denying timesheet', error: error.message });
  }
});

// Get timesheet status and notifications
router.get('/status/:id', authenticateEmployee, async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.employee.id;

    const timesheet = await Timesheet.findOne({
      where: { id, employeeId },
      include: [
        {
          model: Employee,
          as: 'reviewer',
          attributes: ['id', 'name'],
          where: { id: sequelize.col('Timesheet.reviewedBy') },
          required: false
        }
      ]
    });

    const notifications = await TimesheetNotification.findAll({
      where: { timesheetId: id, employeeId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ timesheet, notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status', error: error.message });
  }
});

module.exports = router; 