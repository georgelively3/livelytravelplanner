const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const Trip = require('../models/Trip');
const ItineraryDay = require('../models/ItineraryDay');
const Activity = require('../models/Activity');
const ItineraryGenerator = require('../services/ItineraryGenerator');

const router = express.Router();

// Get all trips for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await Trip.findByUserId(req.user.userId);
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error fetching trips' });
  }
});

// Get specific trip with full itinerary
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Get itinerary days
    const days = await ItineraryDay.findByTripId(trip.id);
    
    // Get activities for each day
    const itinerary = await Promise.all(
      days.map(async (day) => {
        const activities = await Activity.findByDayId(day.id);
        return {
          ...day,
          activities
        };
      })
    );

    res.json({
      ...trip,
      itinerary
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Server error fetching trip' });
  }
});

// Create new trip
router.post('/', [
  authenticateToken,
  body('title').notEmpty().trim(),
  body('destination').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('travelerProfileId').isInt(),
  body('numberOfTravelers').optional().isInt({ min: 1 }),
  body('budget').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tripData = {
      ...req.body,
      userId: req.user.userId
    };

    // Create trip
    const trip = await Trip.create(tripData);

    // Generate itinerary
    await ItineraryGenerator.generateItinerary(trip);

    // Return trip with generated itinerary
    const tripWithItinerary = await Trip.findById(trip.id);
    const days = await ItineraryDay.findByTripId(trip.id);
    
    const itinerary = await Promise.all(
      days.map(async (day) => {
        const activities = await Activity.findByDayId(day.id);
        return {
          ...day,
          activities
        };
      })
    );

    res.status(201).json({
      ...tripWithItinerary,
      itinerary
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error creating trip' });
  }
});

// Update trip
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updatedTrip = await Trip.update(req.params.id, req.body);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Server error updating trip' });
  }
});

// Delete trip
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await Trip.delete(req.params.id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
});

module.exports = router;