const Trip = require('../../models/Trip');
const User = require('../../models/User');
const { initializeTestDatabase, clearDatabase } = require('../../config/testDatabase');

describe('Trip Model', () => {
  let testUser;

  beforeAll(async () => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    await initializeTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user for trip operations
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
  });

  describe('create', () => {
    it('should create a new trip successfully', async () => {
      const tripData = {
        title: 'Amazing Paris Trip',
        destination: 'Paris, France',
        startDate: '2025-12-01',
        endDate: '2025-12-05',
        numberOfTravelers: 2,
        budget: 1500,
        userId: testUser.id
      };

      const trip = await Trip.create(tripData);
      
      expect(trip).toBeDefined();
      expect(trip.id).toBeDefined();
      expect(trip.title).toBe(tripData.title);
      expect(trip.destination).toBe(tripData.destination);
      expect(trip.start_date).toBe(tripData.startDate);
      expect(trip.end_date).toBe(tripData.endDate);
      expect(trip.number_of_travelers).toBe(tripData.numberOfTravelers);
      expect(trip.budget).toBe(tripData.budget);
      expect(trip.user_id).toBe(testUser.id);
      expect(trip.created_at).toBeDefined();
    });

    it('should create trip without budget (optional field)', async () => {
      const tripData = {
        title: 'Budget-Free Trip',
        destination: 'London, UK',
        startDate: '2025-11-01',
        endDate: '2025-11-05',
        numberOfTravelers: 1,
        userId: testUser.id
        // No budget provided
      };

      const trip = await Trip.create(tripData);
      
      expect(trip).toBeDefined();
      expect(trip.budget).toBeNull();
    });

    it('should throw error for missing required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Trip'
        // missing required fields
      };

      await expect(Trip.create(incompleteData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find trip by id', async () => {
      const tripData = {
        title: 'Find Me Trip',
        destination: 'Rome, Italy',
        startDate: '2025-10-01',
        endDate: '2025-10-05',
        numberOfTravelers: 3,
        userId: testUser.id
      };

      const createdTrip = await Trip.create(tripData);
      const foundTrip = await Trip.findById(createdTrip.id);
      
      expect(foundTrip).toBeDefined();
      expect(foundTrip.id).toBe(createdTrip.id);
      expect(foundTrip.title).toBe(tripData.title);
    });

    it('should return null for non-existent id', async () => {
      const trip = await Trip.findById(999);
      expect(trip).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all trips for a user', async () => {
      const trip1Data = {
        title: 'User Trip 1',
        destination: 'Barcelona, Spain',
        startDate: '2025-09-01',
        endDate: '2025-09-05',
        numberOfTravelers: 2,
        userId: testUser.id
      };

      const trip2Data = {
        title: 'User Trip 2',
        destination: 'Amsterdam, Netherlands',
        startDate: '2025-10-01',
        endDate: '2025-10-05',
        numberOfTravelers: 1,
        userId: testUser.id
      };

      await Trip.create(trip1Data);
      await Trip.create(trip2Data);

      const userTrips = await Trip.findByUserId(testUser.id);
      
      expect(userTrips).toBeDefined();
      expect(userTrips.length).toBe(2);
      expect(userTrips[0].user_id).toBe(testUser.id);
      expect(userTrips[1].user_id).toBe(testUser.id);
    });

    it('should return empty array for user with no trips', async () => {
      const trips = await Trip.findByUserId(testUser.id);
      expect(trips).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update trip successfully', async () => {
      const tripData = {
        title: 'Original Title',
        destination: 'Original Destination',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        numberOfTravelers: 2,
        userId: testUser.id
      };

      const trip = await Trip.create(tripData);
      const updatedData = {
        title: 'Updated Title',
        budget: 2000
      };

      const updatedTrip = await Trip.update(trip.id, updatedData);
      
      expect(updatedTrip.title).toBe('Updated Title');
      expect(updatedTrip.budget).toBe(2000);
      expect(updatedTrip.destination).toBe(tripData.destination); // unchanged
    });

    it('should return null for non-existent trip', async () => {
      const result = await Trip.update(999, { title: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete trip successfully', async () => {
      const tripData = {
        title: 'Delete This Trip',
        destination: 'Delete City',
        startDate: '2025-07-01',
        endDate: '2025-07-05',
        numberOfTravelers: 1,
        userId: testUser.id
      };

      const trip = await Trip.create(tripData);
      const deleted = await Trip.delete(trip.id);
      
      expect(deleted).toBe(true);
      
      const foundTrip = await Trip.findById(trip.id);
      expect(foundTrip).toBeNull();
    });

    it('should return false for non-existent trip', async () => {
      const result = await Trip.delete(999);
      expect(result).toBe(false);
    });
  });
});