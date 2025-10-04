const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const AIItineraryService = require('../services/AIItineraryService');
const UserPersona = require('../models/UserPersona');
const Trip = require('../models/Trip');
const ItineraryDay = require('../models/ItineraryDay');
const Activity = require('../models/Activity');

const router = express.Router();
const aiService = new AIItineraryService();

// Generate AI itinerary preview (without saving)
router.post('/preview', [
  authenticateToken,
  body('destination').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('personaId').optional().isInt(),
  body('budget').optional().isFloat({ min: 0 }),
  body('travelers').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { destination, startDate, endDate, personaId, budget = 1000, travelers = 1 } = req.body;

    // Get persona if provided
    let persona = null;
    if (personaId) {
      persona = await UserPersona.findById(personaId);
      if (!persona || persona.user_id !== req.user.userId) {
        return res.status(404).json({ message: 'Persona not found' });
      }
    }

    // Generate AI itinerary
    const itinerary = await aiService.generateItinerary({
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      persona,
      budget,
      travelers
    });

    res.json({
      message: 'AI itinerary generated successfully',
      itinerary,
      preview: true
    });

  } catch (error) {
    console.error('Error generating AI itinerary preview:', error);
    res.status(500).json({ message: 'Failed to generate itinerary preview' });
  }
});

// Generate and save AI-powered trip
router.post('/generate-trip', [
  authenticateToken,
  body('title').notEmpty().trim(),
  body('destination').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('personaId').optional().isInt(),
  body('budget').optional().isFloat({ min: 0 }),
  body('travelers').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, destination, startDate, endDate, personaId, budget = 1000, travelers = 1 } = req.body;

    // Get persona if provided
    let persona = null;
    if (personaId) {
      persona = await UserPersona.findById(personaId);
      if (!persona || persona.user_id !== req.user.userId) {
        return res.status(404).json({ message: 'Persona not found' });
      }
    }

    // Generate AI itinerary
    const aiItinerary = await aiService.generateItinerary({
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      persona,
      budget,
      travelers
    });

    // Create trip in database
    const tripData = {
      title,
      destination,
      startDate,
      endDate,
      userId: req.user.userId,
      travelerProfileId: null, // We don't use traveler profiles for AI trips, only personas
      numberOfTravelers: travelers,
      budget,
      aiGenerated: true
    };

    const trip = await Trip.create(tripData);

    // Save AI-generated itinerary to database
    for (const dayData of aiItinerary.dailyItinerary) {
      // Create itinerary day
      const day = await ItineraryDay.create({
        tripId: trip.id,
        date: dayData.date,
        dayNumber: dayData.dayNumber
      });

      // Create activities for this day
      for (const activityData of dayData.activities) {
        await Activity.create({
          dayId: day.id,
          title: activityData.title,
          description: activityData.description,
          timeSlot: activityData.timeSlot,
          startTime: activityData.startTime,
          endTime: activityData.endTime,
          location: activityData.location,
          category: activityData.category,
          cost: activityData.estimatedCost,
          reservationRequired: activityData.reservationRequired,
          accessibility: JSON.stringify(activityData.accessibility),
          notes: activityData.tips
        });
      }
    }

    res.status(201).json({
      message: 'AI-powered trip created successfully',
      trip,
      aiItinerary,
      saved: true
    });

  } catch (error) {
    console.error('Error creating AI-powered trip:', error);
    res.status(500).json({ message: 'Failed to create AI-powered trip' });
  }
});

// Regenerate itinerary for existing trip
router.post('/regenerate/:tripId', [
  authenticateToken,
  body('useNewPreferences').optional().isBoolean(),
  body('budget').optional().isFloat({ min: 0 }),
  body('travelers').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tripId } = req.params;
    const { useNewPreferences = false, budget, travelers } = req.body;

    // Get existing trip
    const trip = await Trip.findById(tripId);
    if (!trip || trip.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Get persona if trip has one
    let persona = null;
    if (trip.traveler_profile_id) {
      persona = await UserPersona.findById(trip.traveler_profile_id);
    }

    // Use provided values or fall back to trip values
    const regenerationParams = {
      destination: trip.destination,
      startDate: new Date(trip.start_date),
      endDate: new Date(trip.end_date),
      persona,
      budget: budget || trip.budget || 1000,
      travelers: travelers || trip.number_of_travelers || 1
    };

    // Generate new AI itinerary
    const newItinerary = await aiService.generateItinerary(regenerationParams);

    // Clear existing itinerary
    const existingDays = await ItineraryDay.findByTripId(tripId);
    for (const day of existingDays) {
      await Activity.deleteByDayId(day.id);
      await ItineraryDay.delete(day.id);
    }

    // Save new AI-generated itinerary
    for (const dayData of newItinerary.dailyItinerary) {
      // Create itinerary day
      const day = await ItineraryDay.create({
        tripId: trip.id,
        date: dayData.date,
        dayNumber: dayData.dayNumber
      });

      // Create activities for this day
      for (const activityData of dayData.activities) {
        await Activity.create({
          dayId: day.id,
          title: activityData.title,
          description: activityData.description,
          timeSlot: activityData.timeSlot,
          startTime: activityData.startTime,
          endTime: activityData.endTime,
          location: activityData.location,
          category: activityData.category,
          cost: activityData.estimatedCost,
          reservationRequired: activityData.reservationRequired,
          accessibility: JSON.stringify(activityData.accessibility),
          notes: activityData.tips
        });
      }
    }

    res.json({
      message: 'Itinerary regenerated successfully',
      trip,
      newItinerary,
      regenerated: true
    });

  } catch (error) {
    console.error('Error regenerating itinerary:', error);
    res.status(500).json({ message: 'Failed to regenerate itinerary' });
  }
});

// Get AI suggestions for a destination
router.get('/suggestions/:destination', authenticateToken, async (req, res) => {
  try {
    const { destination } = req.params;
    const { personaId, budget = 1000, days = 3 } = req.query;

    // Get persona if provided
    let persona = null;
    if (personaId) {
      persona = await UserPersona.findById(personaId);
      if (!persona || persona.user_id !== req.user.userId) {
        return res.status(404).json({ message: 'Persona not found' });
      }
    }

    // Generate quick suggestions without full itinerary
    const personaType = aiService.determinePersonaType(persona);
    const templates = aiService.getActivityTemplates(personaType);
    
    const suggestions = {
      destination,
      personaType,
      recommendedActivities: {
        morning: templates.morning.slice(0, 3),
        afternoon: templates.afternoon.slice(0, 3),
        evening: templates.evening.slice(0, 2)
      },
      estimatedBudgetPerDay: Math.round(budget / days),
      tips: [
        `Best suited for ${persona ? persona.name : 'general'} travelers`,
        `Budget allows for ${Math.round(budget / days / 50)} premium activities per day`,
        'Consider booking restaurants and tours in advance'
      ]
    };

    res.json({
      message: 'AI suggestions generated',
      suggestions
    });

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
});

module.exports = router;