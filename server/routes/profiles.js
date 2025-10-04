const express = require('express');
const TravelerProfile = require('../models/TravelerProfile');

const router = express.Router();

// Get all traveler profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await TravelerProfile.getAll();
    res.json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Server error fetching profiles' });
  }
});

// Get specific traveler profile
router.get('/:id', async (req, res) => {
  try {
    const profile = await TravelerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Create new traveler profile (admin only)
router.post('/', async (req, res) => {
  try {
    const profile = await TravelerProfile.create(req.body);
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Server error creating profile' });
  }
});

module.exports = router;