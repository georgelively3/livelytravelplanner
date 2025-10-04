const fs = require('fs');
const path = require('path');

// Create test database for each test run
const testDbPath = path.join(__dirname, '..', 'test.db');

beforeEach(() => {
  // Remove test database if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_PATH = testDbPath;
  process.env.JWT_SECRET = 'test-secret-key';
});

afterEach(() => {
  // Clean up test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Global test utilities
global.testUtils = {
  createTestUser: () => ({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  }),
  
  createTestTrip: () => ({
    title: 'Test Trip',
    destination: 'Paris, France',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    travelerProfileId: 1,
    numberOfTravelers: 2,
    budget: 1500
  }),

  createTestPersona: () => ({
    baseProfileId: 1,
    personalPreferences: {
      interests: ['Museums', 'Art Galleries'],
      cuisineTypes: ['Local', 'Street Food'],
      relaxationImportance: 5
    },
    constraints: {
      timeConstraints: [],
      budgetFlexibility: 7
    },
    budgetDetails: {
      totalBudget: '2000',
      dailyBudget: '200',
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
      companions: [],
      decisionMaker: 'me',
      pacePreference: 'moderate'
    }
  }),

  createComplexPersona: () => ({
    baseProfileId: 1,
    personalPreferences: {
      interests: ['Museums & Galleries', 'Historical Sites', 'Local Markets', 'Photography'],
      cuisineTypes: ['Local Street Food', 'Traditional Cuisine', 'Fine Dining', 'Vegetarian'],
      activityLevels: ['Moderate', 'Cultural', 'Educational'],
      culturalInterests: ['Art', 'History', 'Architecture', 'Music'],
      shoppingPreferences: ['Local Crafts', 'Antiques', 'Art'],
      nightlife: false,
      outdoorActivities: true,
      relaxationImportance: 6
    },
    constraints: {
      timeConstraints: ['Early morning starts OK', 'Need afternoon rest'],
      physicalLimitations: ['Limited walking distance', 'Need frequent breaks'],
      dietaryRestrictions: ['Vegetarian', 'No seafood'],
      languageBarriers: false,
      budgetFlexibility: 8
    },
    budgetDetails: {
      totalBudget: '5000',
      dailyBudget: '500',
      categoryAllocations: {
        accommodation: 35,
        food: 25,
        activities: 30,
        transportation: 10
      },
      splurgeAreas: ['Unique Experiences', 'Fine Dining', 'Accommodation']
    },
    accessibility: {
      mobilityNeeds: ['Elevator access required', 'Wheelchair accessible'],
      sensoryNeeds: ['Audio descriptions helpful', 'Large print materials'],
      cognitiveNeeds: [],
      communicationNeeds: ['English speaking guides preferred']
    },
    groupDynamics: {
      companions: ['spouse', 'elderly parent'],
      decisionMaker: 'shared',
      pacePreference: 'slow',
      compromiseAreas: ['Accommodation level', 'Activity types', 'Schedule flexibility']
    }
  })
};