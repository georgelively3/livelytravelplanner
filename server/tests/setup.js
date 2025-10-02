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
  })
};