const request = require('supertest');
const app = require('../../index');
const UserPersona = require('../../models/UserPersona');

describe('AI Routes', () => {
  let authToken;
  let testUserId;
  let testPersonaId;

  beforeEach(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'ai-test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ai-test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
    testUserId = loginResponse.body.user.id;

    // Create a test persona
    const persona = await UserPersona.create({
      userId: testUserId,
      baseProfileId: 1,
      personalPreferences: { activities: ['culture', 'food'] },
      constraints: {},
      budgetDetails: {},
      accessibility: {},
      groupDynamics: {}
    });
    testPersonaId = persona.id;
  });

  describe('POST /api/ai/preview', () => {
    test('should generate itinerary preview successfully', async () => {
      const requestData = {
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-03',
        personaId: testPersonaId,
        budget: 1500,
        travelers: 2
      };

      const response = await request(app)
        .post('/api/ai/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(200);

      expect(response.body.message).toBe('AI itinerary generated successfully');
      expect(response.body.preview).toBe(true);
      expect(response.body.itinerary).toBeDefined();
      expect(response.body.itinerary.destination).toBe('Paris, France');
      expect(response.body.itinerary.days).toBe(3);
      expect(response.body.itinerary.totalBudget).toBe(1500);
      expect(response.body.itinerary.travelers).toBe(2);
      expect(response.body.itinerary.dailyItinerary).toHaveLength(3);
    });

    test('should generate preview without persona', async () => {
      const requestData = {
        destination: 'Tokyo, Japan',
        startDate: '2024-07-01',
        endDate: '2024-07-02',
        budget: 800,
        travelers: 1
      };

      const response = await request(app)
        .post('/api/ai/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(200);

      expect(response.body.itinerary.destination).toBe('Tokyo, Japan');
      expect(response.body.itinerary.days).toBe(2);
    });

    test('should require authentication', async () => {
      const requestData = {
        destination: 'London, UK',
        startDate: '2024-08-01',
        endDate: '2024-08-02'
      };

      await request(app)
        .post('/api/ai/preview')
        .send(requestData)
        .expect(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: '',
          startDate: '2024-08-01'
          // Missing endDate
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should reject invalid persona ID', async () => {
      const requestData = {
        destination: 'Berlin, Germany',
        startDate: '2024-09-01',
        endDate: '2024-09-02',
        personaId: 99999, // Non-existent persona
        budget: 1000,
        travelers: 1
      };

      await request(app)
        .post('/api/ai/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(404);
    });
  });

  describe('POST /api/ai/generate-trip', () => {
    test('should create AI-powered trip successfully', async () => {
      const requestData = {
        title: 'AI-Generated Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-03',
        personaId: testPersonaId,
        budget: 1500,
        travelers: 2
      };

      const response = await request(app)
        .post('/api/ai/generate-trip')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.message).toBe('AI-powered trip created successfully');
      expect(response.body.saved).toBe(true);
      expect(response.body.trip).toBeDefined();
      expect(response.body.trip.title).toBe('AI-Generated Paris Trip');
      expect(response.body.trip.destination).toBe('Paris, France');
      expect(response.body.aiItinerary).toBeDefined();
    });

    test('should create trip without persona', async () => {
      const requestData = {
        title: 'AI Trip to Rome',
        destination: 'Rome, Italy',
        startDate: '2024-07-01',
        endDate: '2024-07-02',
        budget: 800,
        travelers: 1
      };

      const response = await request(app)
        .post('/api/ai/generate-trip')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.trip.destination).toBe('Rome, Italy');
    });

    test('should require authentication', async () => {
      const requestData = {
        title: 'Test Trip',
        destination: 'London, UK',
        startDate: '2024-08-01',
        endDate: '2024-08-02'
      };

      await request(app)
        .post('/api/ai/generate-trip')
        .send(requestData)
        .expect(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/generate-trip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Madrid, Spain',
          startDate: '2024-08-01'
          // Missing title and endDate
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/ai/suggestions/:destination', () => {
    test('should get AI suggestions for destination', async () => {
      const response = await request(app)
        .get('/api/ai/suggestions/Barcelona')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          personaId: testPersonaId,
          budget: 1000,
          days: 3
        })
        .expect(200);

      expect(response.body.message).toBe('AI suggestions generated');
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.destination).toBe('Barcelona');
      expect(response.body.suggestions.recommendedActivities).toBeDefined();
      expect(response.body.suggestions.recommendedActivities.morning).toBeDefined();
      expect(response.body.suggestions.recommendedActivities.afternoon).toBeDefined();
      expect(response.body.suggestions.recommendedActivities.evening).toBeDefined();
      expect(response.body.suggestions.estimatedBudgetPerDay).toBeDefined();
      expect(response.body.suggestions.tips).toBeDefined();
    });

    test('should get suggestions without persona', async () => {
      const response = await request(app)
        .get('/api/ai/suggestions/Amsterdam')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          budget: 800,
          days: 2
        })
        .expect(200);

      expect(response.body.suggestions.destination).toBe('Amsterdam');
      expect(response.body.suggestions.personaType).toBe('cultural'); // Default
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/ai/suggestions/Vienna')
        .expect(401);
    });
  });
});