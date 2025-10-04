const UserPersona = require('../../models/UserPersona');
const User = require('../../models/User');
const { query, run } = require('../../config/database');

describe('UserPersona Model - Working Tests', () => {
  let testUserId;
  let testProfileId;

  beforeEach(async () => {
    // Create test user for each test (since global afterEach clears all data)
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `testpersona-${Date.now()}@example.com`, // Unique email for each test
      password: 'hashedpassword'
    });
    testUserId = testUser.id;
    
    // Get the first traveler profile for testing
    const profileResult = await query('SELECT id FROM traveler_profiles LIMIT 1');
    if (profileResult.rows.length > 0) {
      testProfileId = profileResult.rows[0].id;
    } else {
      // If no profiles exist, create one for testing
      await run(`
        INSERT INTO traveler_profiles (name, description, preferences, constraints)
        VALUES (?, ?, ?, ?)
      `, [
        'Test Profile',
        'A test traveler profile',
        JSON.stringify({ activities: ['test'] }),
        JSON.stringify({ budget: 1000 })
      ]);
      const newProfileResult = await query('SELECT id FROM traveler_profiles ORDER BY id DESC LIMIT 1');
      testProfileId = newProfileResult.rows[0].id;
    }
  });

  // No afterEach or afterAll needed - global cleanup handles everything

  describe('create', () => {
    it('should create a new persona with complete data', async () => {
      const personaData = {
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: {
          interests: ['Museums', 'Art Galleries'],
          cuisineTypes: ['Local', 'Vegetarian'],
          relaxationImportance: 7
        },
        constraints: {
          timeConstraints: ['Need afternoon rest'],
          budgetFlexibility: 5
        },
        budgetDetails: {
          totalBudget: '2000',
          dailyBudget: '250',
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

      const persona = await UserPersona.create(personaData);

      expect(persona).toBeDefined();
      expect(persona.id).toBeDefined();
      expect(persona.user_id).toBe(testUserId);
      expect(persona.base_profile_id).toBe(testProfileId);
      expect(JSON.parse(persona.personal_preferences)).toEqual(personaData.personalPreferences);
      expect(JSON.parse(persona.constraints)).toEqual(personaData.constraints);
      expect(JSON.parse(persona.budget_details)).toEqual(personaData.budgetDetails);
      expect(JSON.parse(persona.accessibility_needs)).toEqual(personaData.accessibility);
      expect(JSON.parse(persona.group_dynamics)).toEqual(personaData.groupDynamics);
    });

    it('should create persona with minimal required data', async () => {
      const personaData = {
        userId: testUserId,
        baseProfileId: testProfileId, // Using valid profile ID to avoid constraint issues
        personalPreferences: { interests: ['Minimal Test'] }
      };

      const persona = await UserPersona.create(personaData);

      expect(persona).toBeDefined();
      expect(persona.id).toBeDefined();
      expect(persona.user_id).toBe(testUserId);
      expect(persona.base_profile_id).toBe(testProfileId);
      expect(JSON.parse(persona.personal_preferences)).toEqual(personaData.personalPreferences);
    });
  });

  describe('findByUserId', () => {
    let testPersonaId;

    beforeEach(async () => {
      const persona = await UserPersona.create({
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: { interests: ['Test'] }
      });
      testPersonaId = persona.id;
    });

    it('should return personas for valid user ID', async () => {
      const personas = await UserPersona.findByUserId(testUserId);

      expect(personas).toBeDefined();
      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBeGreaterThan(0);
      expect(personas[0].user_id).toBe(testUserId);
      expect(personas[0].base_profile_name).toBeDefined(); // Should have joined profile name
    });

    it('should return empty array for user with no personas', async () => {
      const personas = await UserPersona.findByUserId(999);

      expect(personas).toBeDefined();
      expect(Array.isArray(personas)).toBe(true);
      expect(personas.length).toBe(0);
    });
  });

  describe('findById', () => {
    let testPersonaId;

    beforeEach(async () => {
      const persona = await UserPersona.create({
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: { interests: ['Test'] }
      });
      testPersonaId = persona.id;
    });

    it('should return persona for valid ID', async () => {
      const persona = await UserPersona.findById(testPersonaId);

      expect(persona).toBeDefined();
      expect(persona.id).toBe(testPersonaId);
      expect(persona.user_id).toBe(testUserId);
      expect(persona.base_profile_name).toBeDefined(); // Should have joined profile name
    });

    it('should return undefined for invalid ID', async () => {
      const persona = await UserPersona.findById(999);

      expect(persona).toBeUndefined();
    });
  });

  describe('update', () => {
    let testPersonaId;

    beforeEach(async () => {
      const persona = await UserPersona.create({
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: { interests: ['Original'] },
        constraints: { original: true },
        budgetDetails: { total: 1000 }
      });
      testPersonaId = persona.id;
    });

    it('should update persona with new data', async () => {
      const updateData = {
        personalPreferences: { interests: ['Updated'] },
        constraints: { updated: true }
      };

      const updated = await UserPersona.update(testPersonaId, updateData);

      expect(updated).toBeDefined();
      expect(JSON.parse(updated.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(updated.constraints)).toEqual(updateData.constraints);
    });

    it('should preserve unchanged fields during update', async () => {
      const updateData = {
        personalPreferences: { interests: ['Updated'] }
      };

      const updated = await UserPersona.update(testPersonaId, updateData);

      expect(updated).toBeDefined();
      expect(JSON.parse(updated.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(updated.budget_details)).toEqual({ total: 1000 });
    });
  });

  describe('JSON data integrity', () => {
    it('should properly serialize and deserialize complex JSON objects', async () => {
      const complexData = {
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: {
          interests: ['Museums', 'Galleries', 'Historical Sites'],
          cuisineTypes: ['Local', 'Street Food', 'Fine Dining'],
          activityLevels: ['Moderate', 'Active'],
          culturalInterests: ['Art', 'History', 'Architecture'],
          relaxationImportance: 8,
          outdoorActivities: true,
          nightlife: false
        },
        constraints: {
          timeConstraints: ['Early starts OK', 'No late dinners'],
          physicalLimitations: ['Limited walking'],
          dietaryRestrictions: ['Vegetarian', 'No nuts'],
          languageBarriers: true,
          budgetFlexibility: 7
        },
        budgetDetails: {
          totalBudget: '5000',
          dailyBudget: '500',
          categoryAllocations: {
            accommodation: 35,
            food: 30,
            activities: 25,
            transportation: 10
          },
          splurgeAreas: ['Fine Dining', 'Unique Experiences']
        },
        accessibility: {
          mobilityNeeds: ['Wheelchair accessible'],
          sensoryNeeds: ['Audio descriptions'],
          cognitiveNeeds: [],
          communicationNeeds: ['Sign language']
        },
        groupDynamics: {
          companions: ['spouse', 'elderly parent'],
          decisionMaker: 'shared',
          pacePreference: 'slow',
          compromiseAreas: ['Accommodation level', 'Activity types']
        }
      };

      const created = await UserPersona.create(complexData);
      const retrieved = await UserPersona.findById(created.id);

      // Verify JSON integrity
      expect(JSON.parse(retrieved.personal_preferences)).toEqual(complexData.personalPreferences);
      expect(JSON.parse(retrieved.constraints)).toEqual(complexData.constraints);
      expect(JSON.parse(retrieved.budget_details)).toEqual(complexData.budgetDetails);
      expect(JSON.parse(retrieved.accessibility_needs)).toEqual(complexData.accessibility);
      expect(JSON.parse(retrieved.group_dynamics)).toEqual(complexData.groupDynamics);
    });
  });

  describe('Model functionality validation', () => {
    it('should demonstrate complete CRUD operations', async () => {
      // Create
      const createData = {
        userId: testUserId,
        baseProfileId: testProfileId,
        personalPreferences: { interests: ['CRUD Test'] },
        constraints: { testMode: true }
      };
      
      const created = await UserPersona.create(createData);
      expect(created.id).toBeDefined();
      
      // Read by ID
      const retrieved = await UserPersona.findById(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(JSON.parse(retrieved.personal_preferences)).toEqual(createData.personalPreferences);
      
      // Read by User ID
      const userPersonas = await UserPersona.findByUserId(testUserId);
      expect(userPersonas.length).toBeGreaterThan(0);
      expect(userPersonas.some(p => p.id === created.id)).toBe(true);
      
      // Update
      const updateData = {
        personalPreferences: { interests: ['CRUD Test Updated'] },
        constraints: { testMode: false, updated: true }
      };
      
      const updated = await UserPersona.update(created.id, updateData);
      expect(JSON.parse(updated.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(updated.constraints)).toEqual(updateData.constraints);
      
      // Verify update persisted
      const retrievedAfterUpdate = await UserPersona.findById(created.id);
      expect(JSON.parse(retrievedAfterUpdate.personal_preferences)).toEqual(updateData.personalPreferences);
      expect(JSON.parse(retrievedAfterUpdate.constraints)).toEqual(updateData.constraints);
    });
  });
});