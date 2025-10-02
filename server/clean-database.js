const { run, query } = require('./config/database');

async function cleanDatabase() {
  try {
    console.log('Cleaning database - removing all users except test@test.com...');
    
    // First, let's see what users exist
    const allUsers = await query('SELECT id, email, first_name, last_name FROM users');
    console.log('Current users in database:');
    allUsers.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
    });
    
    // Delete all users except test@test.com
    const result = await run('DELETE FROM users WHERE email != ?', ['test@test.com']);
    console.log(`\nDeleted ${result.changes} users (kept test@test.com)`);
    
    // Verify remaining users
    const remainingUsers = await query('SELECT id, email, first_name, last_name FROM users');
    console.log('\nRemaining users:');
    remainingUsers.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
    });
    
    // Also clean up any orphaned trips, activities, etc. related to deleted users
    console.log('\nCleaning up related data...');
    
    const tripsDeleted = await run('DELETE FROM trips WHERE user_id NOT IN (SELECT id FROM users)');
    console.log(`Deleted ${tripsDeleted.changes} orphaned trips`);
    
    const reservationsDeleted = await run('DELETE FROM reservations WHERE user_id NOT IN (SELECT id FROM users)');
    console.log(`Deleted ${reservationsDeleted.changes} orphaned reservations`);
    
    console.log('\n✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    process.exit(0);
  }
}

cleanDatabase();