const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const UserPersona = require('../models/UserPersona');
const TravelerProfile = require('../models/TravelerProfile');

const router = express.Router();

// Get user's personas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const personas = await UserPersona.findByUserId(req.user.userId);
    res.json({ personas });
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ message: 'Server error fetching personas' });
  }
});

// Create new persona
router.post('/', [
  authenticateToken,
  body('baseProfileId').isInt(),
  body('personalPreferences').isObject(),
  body('constraints').optional().isObject(),
  body('budgetDetails').optional().isObject(),
  body('accessibility').optional().isObject(),
  body('groupDynamics').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const personaData = {
      ...req.body,
      userId: req.user.userId
    };

    const persona = await UserPersona.create(personaData);
    res.status(201).json({ 
      message: 'Persona created successfully', 
      persona 
    });
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({ message: 'Server error creating persona' });
  }
});

// Update persona
router.put('/:id', [
  authenticateToken,
  body('personalPreferences').optional().isObject(),
  body('constraints').optional().isObject(),
  body('budgetDetails').optional().isObject(),
  body('accessibility').optional().isObject(),
  body('groupDynamics').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify persona belongs to user
    const persona = await UserPersona.findById(req.params.id);
    if (!persona || persona.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    const updatedPersona = await UserPersona.update(req.params.id, req.body);
    res.json({ 
      message: 'Persona updated successfully', 
      persona: updatedPersona 
    });
  } catch (error) {
    console.error('Error updating persona:', error);
    res.status(500).json({ message: 'Server error updating persona' });
  }
});

// Get specific persona
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const persona = await UserPersona.findById(req.params.id);
    if (!persona || persona.user_id !== req.user.userId) {
      return res.status(404).json({ message: 'Persona not found' });
    }
    res.json({ persona });
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({ message: 'Server error fetching persona' });
  }
});

module.exports = router;