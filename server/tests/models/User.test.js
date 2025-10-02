const User = require('../../models/User');
const database = require('../../config/database');

describe('User Model', () => {
  beforeEach(async () => {
    // Initialize database for each test
    await database.initialize();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedpassword'
      };

      const user = await User.create(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.createdAt).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedpassword'
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        // missing lastName, email, password
      };

      await expect(User.create(incompleteData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'hashedpassword'
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findByEmail('jane@example.com');
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(userData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@example.com',
        password: 'hashedpassword'
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(userData.email);
    });

    it('should return null for non-existent id', async () => {
      const user = await User.findById(999);
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userData = {
        firstName: 'Original',
        lastName: 'Name',
        email: 'original@example.com',
        password: 'hashedpassword'
      };

      const user = await User.create(userData);
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const updatedUser = await User.update(user.id, updatedData);
      
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.email).toBe(userData.email); // unchanged
    });

    it('should return null for non-existent user', async () => {
      const result = await User.update(999, { firstName: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userData = {
        firstName: 'Delete',
        lastName: 'Me',
        email: 'delete@example.com',
        password: 'hashedpassword'
      };

      const user = await User.create(userData);
      const deleted = await User.delete(user.id);
      
      expect(deleted).toBe(true);
      
      const foundUser = await User.findById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const result = await User.delete(999);
      expect(result).toBe(false);
    });
  });
});