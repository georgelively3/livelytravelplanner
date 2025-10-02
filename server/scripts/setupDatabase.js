const { run, query } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up SQLite database...');

    // Create tables
    const createTablesQueries = [
      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create traveler profiles table
      `CREATE TABLE IF NOT EXISTS traveler_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        preferences TEXT,
        constraints TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create trips table
      `CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        traveler_profile_id INTEGER REFERENCES traveler_profiles(id),
        number_of_travelers INTEGER DEFAULT 1,
        budget REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create itinerary days table
      `CREATE TABLE IF NOT EXISTS itinerary_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        day_number INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create activities table
      `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_id INTEGER REFERENCES itinerary_days(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
        start_time TIME,
        end_time TIME,
        location TEXT,
        category TEXT,
        cost REAL,
        reservation_required BOOLEAN DEFAULT 0,
        accessibility TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Create reservations table
      `CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT,
        confirmation_number TEXT,
        cost REAL,
        reservation_date DATE,
        reservation_time TIME,
        number_of_people INTEGER,
        special_requests TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Execute table creation queries
    for (const sql of createTablesQueries) {
      await run(sql);
    }
    console.log('Tables created successfully');

    // Insert default traveler profiles
    const profilesData = [
      [
        'Mobility-Conscious Traveler',
        'Designed for travelers who need wheelchair access or prefer minimal walking',
        '{"transportation": ["taxi", "shuttle"], "accessibility": ["wheelchair_access", "elevators", "ramps"], "rest_frequency": "high", "walking_distance": "minimal"}',
        '{"max_walking_distance": 200, "requires_elevator": true, "needs_rest_breaks": true}'
      ],
      [
        'Family with Young Children',
        'Perfect for families traveling with kids, featuring shorter activities and child-friendly venues',
        '{"activity_duration": "short", "venues": ["playground", "aquarium", "zoo", "park"], "meal_requirements": ["kids_menu"], "rest_time": "afternoon"}',
        '{"max_activity_duration": 120, "needs_nap_time": true, "child_friendly_only": true}'
      ],
      [
        'Foodie / Culinary Explorer',
        'For travelers who want to experience local cuisine, food tours, and culinary adventures',
        '{"focus": ["restaurants", "food_tours", "markets", "cooking_classes"], "meal_priority": "high", "local_cuisine": true}',
        '{"min_food_activities": 3, "restaurant_reservations": true, "dietary_considerations": true}'
      ],
      [
        'Adventure / Active Traveler',
        'High-energy itineraries for travelers who love physical activities and outdoor adventures',
        '{"activities": ["hiking", "biking", "kayaking", "climbing"], "energy_level": "high", "outdoor_focus": true, "early_start": true}',
        '{"min_physical_activity": 2, "fitness_level_required": "moderate", "weather_dependent": true}'
      ],
      [
        'Cultural Enthusiast / History Buff',
        'In-depth exploration of museums, historical sites, and cultural landmarks',
        '{"venues": ["museums", "galleries", "historic_sites", "tours"], "depth": "detailed", "guided_tours": true, "traditional_dining": true}',
        '{"min_cultural_sites": 2, "guided_tour_preference": true, "educational_focus": true}'
      ]
    ];

    // Check if profiles already exist
    const existingProfiles = await query('SELECT COUNT(*) as count FROM traveler_profiles');
    if (existingProfiles.rows[0].count === 0) {
      const insertProfileQuery = `
        INSERT INTO traveler_profiles (name, description, preferences, constraints) 
        VALUES (?, ?, ?, ?)
      `;

      for (const profile of profilesData) {
        await run(insertProfileQuery, profile);
      }
      console.log('Default traveler profiles inserted');
    } else {
      console.log('Traveler profiles already exist, skipping insertion');
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;