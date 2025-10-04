const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create database connection
const dbPath = path.join(__dirname, 'database', 'travel_planner.db');
const db = new sqlite3.Database(dbPath);

console.log('Fixing user_personas table structure...');

db.serialize(() => {
  // Drop the existing table if it exists
  db.run(`DROP TABLE IF EXISTS user_personas`, function(err) {
    if (err) {
      console.error('Error dropping user_personas table:', err);
    } else {
      console.log('Dropped existing user_personas table');
    }
  });

  // Create the table with correct structure
  db.run(`
    CREATE TABLE user_personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      base_profile_id INTEGER,
      personal_preferences TEXT,
      constraints TEXT,
      budget_details TEXT,
      accessibility_needs TEXT,
      group_dynamics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (base_profile_id) REFERENCES traveler_profiles(id)
    )
  `, function(err) {
    if (err) {
      console.error('Error creating user_personas table:', err);
    } else {
      console.log('user_personas table created with correct structure');
    }
  });

  // Create index
  db.run(`
    CREATE INDEX idx_user_personas_user_id 
    ON user_personas(user_id)
  `, function(err) {
    if (err) {
      console.error('Error creating index:', err);
    } else {
      console.log('Index created successfully');
    }
  });
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database table fix completed successfully');
  }
});