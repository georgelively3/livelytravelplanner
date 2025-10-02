const express = require('express');
const authenticateToken = require('../middleware/auth');
const Activity = require('../models/Activity');

const router = express.Router();

// Get activities for a specific day
router.get('/day/:dayId', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.findByDayId(req.params.dayId);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

// Create new activity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error creating activity' });
  }
});

// Update activity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.update(req.params.id, req.body);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error updating activity' });
  }
});

// Delete activity
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.delete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error deleting activity' });
  }
});

module.exports = router;