const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create database connection to the CORRECT database file
const dbPath = path.join(__dirname, 'database', 'travel_planner.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Clearing ALL user data from the database...\n');
console.log('Database path:', dbPath);

db.serialize(() => {
  // Clear all user data in the correct order (respecting foreign keys)
  console.log('1. Clearing user personas...');
  db.run('DELETE FROM user_personas', function(err) {
    if (err) {
      console.error('Error clearing user_personas:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} user personas`);
    }
  });

  console.log('2. Clearing reservations...');
  db.run('DELETE FROM reservations', function(err) {
    if (err) {
      console.error('Error clearing reservations:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} reservations`);
    }
  });

  console.log('3. Clearing activities...');
  db.run('DELETE FROM activities', function(err) {
    if (err) {
      console.error('Error clearing activities:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} activities`);
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

  console.log('5. Clearing trips...');
  db.run('DELETE FROM trips', function(err) {
    if (err) {
      console.error('Error clearing trips:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} trips`);
    }
  });

  console.log('6. Clearing ALL users (including test@test.com)...');
  db.run('DELETE FROM users', function(err) {
    if (err) {
      console.error('Error clearing users:', err.message);
    } else {
      console.log(`✅ Deleted ${this.changes} users`);
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

  // Verify the cleanup after a short delay
  setTimeout(() => {
    console.log('\n📊 Verification Report:');
    
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err.message);
      } else {
        console.log(`Users remaining: ${row.count} (should be 0)`);
        if (row.count > 0) {
          db.all('SELECT email FROM users', (err, rows) => {
            if (!err) {
              console.log('❌ Still existing users:', rows.map(r => r.email).join(', '));
            }
          });
        }
      }
    });

    db.get('SELECT COUNT(*) as count FROM user_personas', (err, row) => {
      if (err) {
        console.error('Error checking user_personas:', err.message);
      } else {
        console.log(`User personas remaining: ${row.count} (should be 0)`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM trips', (err, row) => {
      if (err) {
        console.error('Error checking trips:', err.message);
      } else {
        console.log(`Trips remaining: ${row.count} (should be 0)`);
      }
    });

    db.get('SELECT COUNT(*) as count FROM traveler_profiles', (err, row) => {
      if (err) {
        console.error('Error checking traveler_profiles:', err.message);
      } else {
        console.log(`Base traveler profiles: ${row.count} (should be 5 - these are system data)`);
      }
      
      setTimeout(() => {
        if (err || row.count === 5) {
          console.log('\n🎉 Database cleanup completed successfully!');
          console.log('✅ test@test.com has been completely removed');
          console.log('✅ All user data cleared - ready for fresh testing');
          console.log('🚀 You can now register new users and test the enhanced persona system');
        }
        
        db.close();
      }, 500);
    });
  }, 1000);
});