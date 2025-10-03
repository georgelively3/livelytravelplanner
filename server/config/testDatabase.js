const { query, run } = require('./database');

// Clear all data from database
const clearDatabase = async () => {
  try {
    // Disable foreign key constraints temporarily
    await run('PRAGMA foreign_keys = OFF');
    
    // Clear all tables in reverse dependency order
    await run('DELETE FROM activities');
    await run('DELETE FROM reservations');
    await run('DELETE FROM itinerary_days');
    await run('DELETE FROM trips');
    await run('DELETE FROM traveler_profiles');
    await run('DELETE FROM users');
    
    // Reset auto-increment counters
    await run('DELETE FROM sqlite_sequence WHERE name IN ("users", "trips", "traveler_profiles", "itinerary_days", "reservations", "activities")');
    
    // Re-enable foreign key constraints
    await run('PRAGMA foreign_keys = ON');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Create tables without inserting test data
const createTables = async () => {
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Traveler profiles table
    await run(`
      CREATE TABLE IF NOT EXISTS traveler_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        profile_name TEXT NOT NULL,
        travel_style TEXT,
        budget_range TEXT,
        interests TEXT,
        accessibility_needs TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Trips table
    await run(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        traveler_profile_id INTEGER,
        number_of_travelers INTEGER DEFAULT 1,
        budget DECIMAL(10,2),
        status TEXT DEFAULT 'planning',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (traveler_profile_id) REFERENCES traveler_profiles (id)
      )
    `);

    // Itinerary days table
    await run(`
      CREATE TABLE IF NOT EXISTS itinerary_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        date DATE NOT NULL,
        location TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      )
    `);

    // Activities table
    await run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itinerary_day_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIME,
        end_time TIME,
        location TEXT,
        category TEXT,
        cost DECIMAL(8,2),
        booking_url TEXT,
        notes TEXT,
        status TEXT DEFAULT 'planned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days (id) ON DELETE CASCADE
      )
    `);

    // Reservations table
    await run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        location TEXT,
        cost DECIMAL(10,2),
        confirmation_number TEXT,
        booking_url TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
      )
    `);

    console.log('Test database tables created successfully');
  } catch (error) {
    console.error('Error creating test database tables:', error);
    throw error;
  }
};

// Initialize test database
const initializeTestDatabase = async () => {
  await createTables();
  await clearDatabase();
};

module.exports = {
  clearDatabase,
  createTables,
  initializeTestDatabase
};