// Jest setup file for test environment configuration
const { initializeTestDatabase, clearDatabase } = require('./config/testDatabase');

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Global test setup that runs once before all tests
beforeAll(async () => {
  try {
    await initializeTestDatabase();
    console.log('Global test database initialized');
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  }
});

// Clean data between test suites to prevent interference
afterEach(async () => {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('Failed to clear database:', error);
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
    numberOfTravelers: 2,
    budget: 1500
  })
};

// Increase timeout for database operations
jest.setTimeout(15000);