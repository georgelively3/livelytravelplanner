const express = require('express');
const authenticateToken = require('../middleware/auth');
const Reservation = require('../models/Reservation');

const router = express.Router();

// Get reservations for an activity
router.get('/activity/:activityId', authenticateToken, async (req, res) => {
  try {
    const reservations = await Reservation.findByActivityId(req.params.activityId);
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
});

// Create new reservation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
});

// Update reservation
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.update(req.params.id, req.body);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Server error updating reservation' });
  }
});

// Delete reservation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reservation = await Reservation.delete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Server error deleting reservation' });
  }
});

module.exports = router;