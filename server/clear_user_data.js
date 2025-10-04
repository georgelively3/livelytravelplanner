const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create database connection
const dbPath = path.join(__dirname, 'travel_planner.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing user data for fresh start...\n');

db.serialize(() => {
  // Clear all user-related data (only tables that exist)
  console.log('1. Clearing user personas...');
  db.run('DELETE FROM user_personas', function(err) {
    if (err) {
      console.error('Error clearing user_personas:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} user personas`);
    }
  });

  console.log('2. Clearing users...');
  db.run('DELETE FROM users', function(err) {
    if (err) {
      console.error('Error clearing users:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} users (including test@test.com)`);
    }
  });

  console.log('3. Clearing trips...');
  db.run('DELETE FROM trips', function(err) {
    if (err) {
      console.error('Error clearing trips:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} trips`);
    }
  });

  console.log('4. Clearing itinerary days...');
  db.run('DELETE FROM itinerary_days', function(err) {
    if (err) {
      console.error('Error clearing itinerary_days:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} itinerary days`);
    }
  });

  console.log('5. Clearing activities...');
  db.run('DELETE FROM activities', function(err) {
    if (err) {
      console.error('Error clearing activities:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} activities`);
    }
  });

  console.log('6. Clearing reservations...');
  db.run('DELETE FROM reservations', function(err) {
    if (err) {
      console.error('Error clearing reservations:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} reservations`);
    }
  });

  // Reset auto-increment counters
  console.log('7. Resetting ID counters...');
  const tables = ['users', 'trips', 'itinerary_days', 'activities', 'reservations', 'user_personas'];
  
  tables.forEach(table => {
    db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`, function(err) {
      if (err) {
        console.log(`Note: Could not reset ${table} sequence (${err.message})`);
      } else {
        console.log(`✅ Reset ${table} ID counter`);
      }
    });
  });

  // Verify the cleanup
  setTimeout(() => {
    console.log('\n📊 Verifying cleanup...');
    
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err.message);
      } else {
        console.log(`Users remaining: ${row.count}`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM user_personas', (err, row) => {
      if (err) {
        console.error('Error checking user_personas:', err.message);
      } else {
        console.log(`User personas remaining: ${row.count}`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM trips', (err, row) => {
      if (err) {
        console.error('Error checking trips:', err.message);
      } else {
        console.log(`Trips remaining: ${row.count}`);
      }
    });

    // Keep the base traveler profiles (these are system data)
    db.get('SELECT COUNT(*) as count FROM traveler_profiles', (err, row) => {
      if (err) {
        console.error('Error checking traveler_profiles:', err.message);
      } else {
        console.log(`Base traveler profiles kept: ${row.count} (system data)`);
      }
      
      // Close database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('\n🎉 Database cleanup completed successfully!');
          console.log('📝 You can now register fresh users and test the enhanced persona system.');
          console.log('🚀 The test@test.com user has been completely removed.');
        }
      });
    });
  }, 1000); // Wait a moment for all operations to complete
});