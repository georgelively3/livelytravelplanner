const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const UserPersona = require('../../models/UserPersona');
const { run } = require('../../config/database');
const jwt = require('jsonwebtoken');

describe('Personas Routes', () => {
  let testUser;
  let authToken;
  let testPersonaId;

  beforeEach(async () => {
    // Create test user for each test
    testUser = await User.create({
      firstName: 'Persona',
      lastName: 'Tester',
      email: `personas-${Date.now()}@test.com`, // Unique email
      password: 'hashedpassword'
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  // No cleanup needed - global afterEach handles it

  describe('POST /api/personas', () => {
    it('should create a new persona with valid data', async () => {
      const personaData = {
        baseProfileId: 1,
        personalPreferences: {
          interests: ['Museums', 'Art Galleries'],
          cuisineTypes: ['Local', 'Street Food'],
          relaxationImportance: 6
        },
        constraints: {
          timeConstraints: ['Need afternoon rest'],
          budgetFlexibility: 7
        },
        budgetDetails: {
          totalBudget: '3000',
          dailyBudget: '300',
          categoryAllocations: {
            accommodation: 40,
            food: 25,
            activities: 25,
            transportation: 10
          }
        },
        accessibility: {
          mobilityNeeds: [],
          sensoryNeeds: []
        },
        groupDynamics: {
          companions: ['spouse'],
          decisionMaker: 'shared',
          pacePreference: 'moderate'
        }
      };

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(personaData)
        .expect(201);

      expect(response.body.message).toBe('Persona created successfully');
      expect(response.body.persona).toBeDefined();
      expect(response.body.persona.id).toBeDefined();
      expect(response.body.persona.user_id).toBe(testUser.id);

      testPersonaId = response.body.persona.id;
    });

    it('should require authentication', async () => {
      const personaData = {
        baseProfileId: 1,
        personalPreferences: { interests: [] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      };

      await request(app)
        .post('/api/personas')
        .send(personaData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty data
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate baseProfileId is integer', async () => {
      const personaData = {
        baseProfileId: 'invalid',
        personalPreferences: { interests: [] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      };

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(personaData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should validate personalPreferences is object', async () => {
      const personaData = {
        baseProfileId: 1,
        personalPreferences: 'invalid',
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      };

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(personaData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/personas', () => {
    beforeEach(async () => {
      // Create test persona
      const persona = await UserPersona.create({
        userId: testUser.id,
        baseProfileId: 1,
        personalPreferences: { interests: ['Test'] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      });
      testPersonaId = persona.id;
    });

    it('should return user personas', async () => {
      const response = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.personas).toBeDefined();
      expect(Array.isArray(response.body.personas)).toBe(true);
      expect(response.body.personas.length).toBeGreaterThan(0);
      expect(response.body.personas[0].user_id).toBe(testUser.id);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/personas')
        .expect(401);
    });

    it('should return empty array for user with no personas', async () => {
      // Delete the test persona first
      await run('DELETE FROM user_personas WHERE id = ?', [testPersonaId]);
      testPersonaId = null;

      const response = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.personas).toEqual([]);
    });
  });

  describe('GET /api/personas/:id', () => {
    beforeEach(async () => {
      const persona = await UserPersona.create({
        userId: testUser.id,
        baseProfileId: 1,
        personalPreferences: { interests: ['Specific Test'] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      });
      testPersonaId = persona.id;
    });

    it('should return specific persona', async () => {
      const response = await request(app)
        .get(`/api/personas/${testPersonaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.persona).toBeDefined();
      expect(response.body.persona.id).toBe(testPersonaId);
      expect(response.body.persona.user_id).toBe(testUser.id);
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/personas/${testPersonaId}`)
        .expect(401);
    });

    it('should return 404 for non-existent persona', async () => {
      await request(app)
        .get('/api/personas/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow access to other users personas', async () => {
      // Create another user
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'other@test.com',
        password: 'password'
      });

      // Create persona for other user
      const otherPersona = await UserPersona.create({
        userId: otherUser.id,
        baseProfileId: 1,
        personalPreferences: { interests: ['Other'] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      });

      // Try to access other user's persona
      await request(app)
        .get(`/api/personas/${otherPersona.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Clean up
      await run('DELETE FROM user_personas WHERE id = ?', [otherPersona.id]);
      await run('DELETE FROM users WHERE id = ?', [otherUser.id]);
    });
  });

  describe('PUT /api/personas/:id', () => {
    beforeEach(async () => {
      const persona = await UserPersona.create({
        userId: testUser.id,
        baseProfileId: 1,
        personalPreferences: { interests: ['Original'] },
        constraints: { original: true },
        budgetDetails: { total: 1000 },
        accessibility: {},
        groupDynamics: {}
      });
      testPersonaId = persona.id;
    });

    it('should update persona with valid data', async () => {
      const updateData = {
        personalPreferences: {
          interests: ['Updated', 'New Interests'],
          relaxationImportance: 8
        },
        budgetDetails: {
          totalBudget: '4000',
          dailyBudget: '400'
        }
      };

      const response = await request(app)
        .put(`/api/personas/${testPersonaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Persona updated successfully');
      expect(response.body.persona).toBeDefined();
      expect(JSON.parse(response.body.persona.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(response.body.persona.budget_details)).toEqual(updateData.budgetDetails);
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/personas/${testPersonaId}`)
        .send({ personalPreferences: { interests: [] } })
        .expect(401);
    });

    it('should return 404 for non-existent persona', async () => {
      await request(app)
        .put('/api/personas/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ personalPreferences: { interests: [] } })
        .expect(404);
    });

    it('should validate update data types', async () => {
      const response = await request(app)
        .put(`/api/personas/${testPersonaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ personalPreferences: 'invalid' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should not allow updating other users personas', async () => {
      // Create another user and persona
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'other2@test.com',
        password: 'password'
      });

      const otherPersona = await UserPersona.create({
        userId: otherUser.id,
        baseProfileId: 1,
        personalPreferences: { interests: ['Other'] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      });

      // Try to update other user's persona
      await request(app)
        .put(`/api/personas/${otherPersona.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ personalPreferences: { interests: ['Hacked'] } })
        .expect(404);

      // Clean up
      await run('DELETE FROM user_personas WHERE id = ?', [otherPersona.id]);
      await run('DELETE FROM users WHERE id = ?', [otherUser.id]);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error by using invalid token
      const invalidToken = jwt.sign(
        { userId: 99999, email: 'invalid@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          baseProfileId: 1,
          personalPreferences: { interests: [] },
          constraints: {},
          budgetDetails: {},
          accessibility: {},
          groupDynamics: {}
        })
        .expect(500);

      expect(response.body.message).toContain('Server error');
    });
  });
});