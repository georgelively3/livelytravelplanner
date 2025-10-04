const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create database connection
const dbPath = path.join(__dirname, 'travel_planner.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing database for fresh start...\n');

db.serialize(() => {
  // Clear all user-related data
  console.log('1. Clearing user personas...');
  db.run('DELETE FROM user_personas', function(err) {
    if (err) {
      console.error('Error clearing user_personas:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} user personas`);
    }
  });

  console.log('2. Clearing reservations...');
  db.run('DELETE FROM reservations', function(err) {
    if (err) {
      console.error('Error clearing reservations:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} reservations`);
    }
  });

  console.log('3. Clearing activities...');
  db.run('DELETE FROM activities', function(err) {
    if (err) {
      console.error('Error clearing activities:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} activities`);
    }
  });

  console.log('4. Clearing itinerary days...');
  db.run('DELETE FROM itinerary_days', function(err) {
    if (err) {
      console.error('Error clearing itinerary_days:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} itinerary days`);
    }
  });

  console.log('5. Clearing trips...');
  db.run('DELETE FROM trips', function(err) {
    if (err) {
      console.error('Error clearing trips:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} trips`);
    }
  });

  console.log('6. Clearing users (including test@test.com)...');
  db.run('DELETE FROM users', function(err) {
    if (err) {
      console.error('Error clearing users:', err);
    } else {
      console.log(`✅ Deleted ${this.changes} users`);
    }
  });

  // Reset auto-increment counters
  console.log('7. Resetting auto-increment counters...');
  
  const tables = ['users', 'trips', 'itinerary_days', 'activities', 'reservations', 'user_personas'];
  
  tables.forEach(table => {
    db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`, function(err) {
      if (err && !err.message.includes('no such table')) {
        console.error(`Error resetting ${table} sequence:`, err);
      } else {
        console.log(`✅ Reset ${table} ID counter`);
      }
    });
  });

  // Verify the cleanup
  console.log('\n📊 Verifying cleanup...');
  
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
    } else {
      console.log(`Users remaining: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM user_personas', (err, row) => {
    if (err) {
      console.error('Error checking user_personas:', err);
    } else {
      console.log(`User personas remaining: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM trips', (err, row) => {
    if (err) {
      console.error('Error checking trips:', err);
    } else {
      console.log(`Trips remaining: ${row.count}`);
    }
  });

  // Keep the base traveler profiles (these are system data, not user data)
  db.get('SELECT COUNT(*) as count FROM traveler_profiles', (err, row) => {
    if (err) {
      console.error('Error checking traveler_profiles:', err);
    } else {
      console.log(`Base traveler profiles kept: ${row.count} (system data)`);
    }
  });
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('📝 You can now register fresh users and test the enhanced persona system.');
  }
});