const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const UserPersona = require('../../models/UserPersona');
const TravelerProfile = require('../../models/TravelerProfile');
const { run } = require('../../config/database');
const bcrypt = require('bcryptjs');

describe('Persona Integration Tests', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create test user for each test with properly hashed password
    const plainPassword = 'testpassword123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    testUser = await User.create({
      firstName: 'Integration',
      lastName: 'Tester',
      email: `integration-${Date.now()}@test.com`, // Unique email
      password: hashedPassword
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: plainPassword // Use plain password for login
      });

    authToken = loginResponse.body.token;
  });

  // No cleanup needed - global afterEach handles it

  describe('Complete Persona Creation Flow', () => {
    it('should complete the full persona creation workflow', async () => {
      // Step 1: Get available traveler profiles
      const profilesResponse = await request(app)
        .get('/api/profiles')
        .expect(200);

      expect(profilesResponse.body.profiles).toBeDefined();
      expect(profilesResponse.body.profiles.length).toBeGreaterThan(0);

      const baseProfileId = profilesResponse.body.profiles[0].id;

      // Step 2: Create a comprehensive persona
      const personaData = {
        baseProfileId: baseProfileId,
        personalPreferences: {
          interests: ['Museums & Galleries', 'Historical Sites', 'Local Markets'],
          cuisineTypes: ['Local Street Food', 'Traditional Cuisine', 'Fine Dining'],
          activityLevels: ['Moderate', 'Cultural'],
          culturalInterests: ['Art', 'History', 'Architecture'],
          shoppingPreferences: ['Local Crafts', 'Souvenirs'],
          nightlife: false,
          outdoorActivities: true,
          relaxationImportance: 6
        },
        constraints: {
          timeConstraints: ['Early morning starts OK', 'Need afternoon rest'],
          physicalLimitations: ['Limited walking distance'],
          dietaryRestrictions: ['Vegetarian'],
          languageBarriers: false,
          budgetFlexibility: 7
        },
        budgetDetails: {
          totalBudget: '4000',
          dailyBudget: '400',
          categoryAllocations: {
            accommodation: 35,
            food: 25,
            activities: 30,
            transportation: 10
          },
          splurgeAreas: ['Unique Experiences', 'Fine Dining']
        },
        accessibility: {
          mobilityNeeds: ['Elevator access required'],
          sensoryNeeds: ['Audio descriptions helpful'],
          cognitiveNeeds: [],
          communicationNeeds: []
        },
        groupDynamics: {
          companions: ['spouse', 'elderly parent'],
          decisionMaker: 'shared',
          pacePreference: 'slow',
          compromiseAreas: ['Accommodation level', 'Schedule flexibility']
        }
      };

      // Step 3: Create the persona
      const createResponse = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(personaData)
        .expect(201);

      expect(createResponse.body.message).toBe('Persona created successfully');
      expect(createResponse.body.persona).toBeDefined();
      expect(createResponse.body.persona.id).toBeDefined();

      const personaId = createResponse.body.persona.id;

      // Step 4: Verify persona was created correctly
      const getPersonaResponse = await request(app)
        .get(`/api/personas/${personaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const retrievedPersona = getPersonaResponse.body.persona;
      expect(retrievedPersona.id).toBe(personaId);
      expect(retrievedPersona.user_id).toBe(testUser.id);
      expect(retrievedPersona.base_profile_id).toBe(baseProfileId);

      // Verify JSON data integrity
      expect(JSON.parse(retrievedPersona.personal_preferences)).toEqual(personaData.personalPreferences);
      expect(JSON.parse(retrievedPersona.constraints)).toEqual(personaData.constraints);
      expect(JSON.parse(retrievedPersona.budget_details)).toEqual(personaData.budgetDetails);
      expect(JSON.parse(retrievedPersona.accessibility_needs)).toEqual(personaData.accessibility);
      expect(JSON.parse(retrievedPersona.group_dynamics)).toEqual(personaData.groupDynamics);

      // Step 5: Verify it appears in user's persona list
      const listResponse = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.personas).toBeDefined();
      expect(listResponse.body.personas.length).toBe(1);
      expect(listResponse.body.personas[0].id).toBe(personaId);

      // Step 6: Update the persona
      const updateData = {
        personalPreferences: {
          ...personaData.personalPreferences,
          interests: ['Museums & Galleries', 'Historical Sites', 'Photography'],
          relaxationImportance: 8
        },
        budgetDetails: {
          ...personaData.budgetDetails,
          totalBudget: '5000',
          dailyBudget: '500'
        }
      };

      const updateResponse = await request(app)
        .put(`/api/personas/${personaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.message).toBe('Persona updated successfully');

      // Step 7: Verify update was applied
      const updatedPersonaResponse = await request(app)
        .get(`/api/personas/${personaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const updatedPersona = updatedPersonaResponse.body.persona;
      expect(JSON.parse(updatedPersona.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(updatedPersona.budget_details)).toEqual(updateData.budgetDetails);

      // Verify unchanged fields are preserved
      expect(JSON.parse(updatedPersona.constraints)).toEqual(personaData.constraints);
      expect(JSON.parse(updatedPersona.accessibility_needs)).toEqual(personaData.accessibility);

      // Clean up
      await run('DELETE FROM user_personas WHERE id = ?', [personaId]);
    });
  });

  describe('Multi-User Persona Isolation', () => {
    it('should properly isolate personas between different users', async () => {
      // Create another test user with properly hashed password
      const otherPlainPassword = 'otherpassword123';
      const otherHashedPassword = await bcrypt.hash(otherPlainPassword, 10);
      
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: `other-${Date.now()}@integration.com`,
        password: otherHashedPassword
      });

      // Login other user
      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: otherPlainPassword
        });

      const otherAuthToken = otherLoginResponse.body.token;

      // Create persona for first user
      const user1PersonaResponse = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          baseProfileId: 1,
          personalPreferences: { interests: ['User 1 Interest'] },
          constraints: {},
          budgetDetails: {},
          accessibility: {},
          groupDynamics: {}
        })
        .expect(201);

      const user1PersonaId = user1PersonaResponse.body.persona.id;

      // Create persona for second user
      const user2PersonaResponse = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({
          baseProfileId: 1,
          personalPreferences: { interests: ['User 2 Interest'] },
          constraints: {},
          budgetDetails: {},
          accessibility: {},
          groupDynamics: {}
        })
        .expect(201);

      const user2PersonaId = user2PersonaResponse.body.persona.id;

      // User 1 should only see their own persona
      const user1ListResponse = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(user1ListResponse.body.personas.length).toBe(1);
      expect(user1ListResponse.body.personas[0].id).toBe(user1PersonaId);

      // User 2 should only see their own persona
      const user2ListResponse = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(200);

      expect(user2ListResponse.body.personas.length).toBe(1);
      expect(user2ListResponse.body.personas[0].id).toBe(user2PersonaId);

      // User 1 should not be able to access User 2's persona
      await request(app)
        .get(`/api/personas/${user2PersonaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // User 2 should not be able to update User 1's persona
      await request(app)
        .put(`/api/personas/${user1PersonaId}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ personalPreferences: { interests: ['Hacked'] } })
        .expect(404);

      // Clean up
      await run('DELETE FROM user_personas WHERE id IN (?, ?)', [user1PersonaId, user2PersonaId]);
      await run('DELETE FROM users WHERE id = ?', [otherUser.id]);
    });
  });

  describe('Persona Data Validation and Edge Cases', () => {
    it('should handle empty optional fields gracefully', async () => {
      const minimalPersonaData = {
        baseProfileId: 1,
        personalPreferences: { interests: ['Minimal Test'] },
        constraints: {},
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      };

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalPersonaData)
        .expect(201);

      const personaId = response.body.persona.id;

      // Verify persona was created with minimal data
      const getResponse = await request(app)
        .get(`/api/personas/${personaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const persona = getResponse.body.persona;
      expect(JSON.parse(persona.personal_preferences)).toEqual(minimalPersonaData.personalPreferences);
      expect(JSON.parse(persona.constraints)).toEqual({});
      expect(JSON.parse(persona.budget_details)).toEqual({});

      // Clean up
      await run('DELETE FROM user_personas WHERE id = ?', [personaId]);
    });

    it('should handle complex nested JSON structures', async () => {
      const complexPersonaData = {
        baseProfileId: 1,
        personalPreferences: {
          interests: ['Complex', 'Nested', 'Structure'],
          metadata: {
            version: '1.0',
            created: new Date().toISOString(),
            preferences: {
              level1: {
                level2: {
                  level3: ['deep', 'nested', 'array']
                }
              }
            }
          }
        },
        constraints: {
          complex: {
            array: [
              { type: 'mobility', severity: 'moderate', details: ['detail1', 'detail2'] },
              { type: 'dietary', severity: 'strict', details: ['vegetarian', 'no-nuts'] }
            ]
          }
        },
        budgetDetails: {},
        accessibility: {},
        groupDynamics: {}
      };

      const response = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(complexPersonaData)
        .expect(201);

      const personaId = response.body.persona.id;

      // Verify complex data is preserved
      const getResponse = await request(app)
        .get(`/api/personas/${personaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const persona = getResponse.body.persona;
      const retrievedPreferences = JSON.parse(persona.personal_preferences);
      const retrievedConstraints = JSON.parse(persona.constraints);

      expect(retrievedPreferences).toEqual(complexPersonaData.personalPreferences);
      expect(retrievedConstraints).toEqual(complexPersonaData.constraints);

      // Clean up
      await run('DELETE FROM user_personas WHERE id = ?', [personaId]);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent persona operations', async () => {
      const promises = [];

      // Create multiple personas concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/personas')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              baseProfileId: 1,
              personalPreferences: { interests: [`Concurrent Test ${i}`] },
              constraints: {},
              budgetDetails: {},
              accessibility: {},
              groupDynamics: {}
            })
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.persona).toBeDefined();
      });

      // Verify all personas were created
      const listResponse = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body.personas.length).toBe(5);

      // Clean up
      const personaIds = responses.map(r => r.body.persona.id);
      for (const id of personaIds) {
        await run('DELETE FROM user_personas WHERE id = ?', [id]);
      }
    });
  });
});