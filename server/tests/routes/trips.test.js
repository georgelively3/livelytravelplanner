const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const tripRoutes = require('../../routes/trips');
const authMiddleware = require('../../middleware/auth');
const database = require('../../config/database');
const User = require('../../models/User');

const app = express();
app.use(express.json());
app.use('/api/trips', tripRoutes);

describe('Trip Routes', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await database.initialize();
    
    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/trips', () => {
    it('should create a new trip successfully', async () => {
      const tripData = {
        title: 'Amazing Paris Trip',
        destination: 'Paris, France',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
        travelerProfileId: 1,
        numberOfTravelers: 2,
        budget: 1500
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Trip created successfully');
      expect(response.body).toHaveProperty('trip');
      expect(response.body.trip.title).toBe(tripData.title);
      expect(response.body.trip.destination).toBe(tripData.destination);
      expect(response.body.trip.budget).toBe(tripData.budget);
    });

    it('should create trip without budget (optional field)', async () => {
      const tripData = {
        title: 'Budget-Free Trip',
        destination: 'London, UK',
        startDate: '2025-11-01',
        endDate: '2025-11-05',
        travelerProfileId: 2,
        numberOfTravelers: 1
        // No budget provided
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(201);

      expect(response.body.trip.budget).toBeNull();
    });

    it('should return 401 without authentication token', async () => {
      const tripData = {
        title: 'Unauthorized Trip',
        destination: 'Nowhere',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
        travelerProfileId: 1,
        numberOfTravelers: 1
      };

      await request(app)
        .post('/api/trips')
        .send(tripData)
        .expect(401);
    });

    it('should return 400 for invalid trip data', async () => {
      const invalidTripData = {
        title: '', // empty title
        destination: 'Paris',
        startDate: 'invalid-date',
        endDate: '2025-12-05',
        travelerProfileId: 'not-a-number',
        numberOfTravelers: -1 // negative number
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTripData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Trip'
        // missing required fields
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      // Create some test trips
      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trip 1',
          destination: 'Paris, France',
          startDate: '2025-12-01',
          endDate: '2025-12-05',
          travelerProfileId: 1,
          numberOfTravelers: 2
        });

      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trip 2',
          destination: 'London, UK',
          startDate: '2025-11-01',
          endDate: '2025-11-05',
          travelerProfileId: 2,
          numberOfTravelers: 1
        });
    });

    it('should get all trips for authenticated user', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trips');
      expect(response.body.trips).toHaveLength(2);
      expect(response.body.trips[0]).toHaveProperty('title');
      expect(response.body.trips[0]).toHaveProperty('destination');
    });

    it('should return 401 without authentication token', async () => {
      await request(app)
        .get('/api/trips')
        .expect(401);
    });

    it('should return empty array for user with no trips', async () => {
      // Create another user with no trips
      const anotherUser = await User.create({
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'hashedpassword'
      });

      const anotherToken = jwt.sign(
        { userId: anotherUser.id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(200);

      expect(response.body.trips).toHaveLength(0);
    });
  });

  describe('GET /api/trips/:id', () => {
    let testTrip;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Trip for Details',
          destination: 'Rome, Italy',
          startDate: '2025-10-01',
          endDate: '2025-10-05',
          travelerProfileId: 1,
          numberOfTravelers: 2,
          budget: 2000
        });

      testTrip = response.body.trip;
    });

    it('should get trip details for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTrip.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trip');
      expect(response.body.trip.id).toBe(testTrip.id);
      expect(response.body.trip.title).toBe('Test Trip for Details');
    });

    it('should return 404 for non-existent trip', async () => {
      await request(app)
        .get('/api/trips/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication token', async () => {
      await request(app)
        .get(`/api/trips/${testTrip.id}`)
        .expect(401);
    });

    it('should return 404 when trying to access another user\'s trip', async () => {
      // Create another user
      const anotherUser = await User.create({
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        password: 'hashedpassword'
      });

      const anotherToken = jwt.sign(
        { userId: anotherUser.id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '1h' }
      );

      await request(app)
        .get(`/api/trips/${testTrip.id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(404);
    });
  });
});