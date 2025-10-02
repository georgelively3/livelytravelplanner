const { query } = require('./config/database');

async function testDatabase() {
  try {
    // Check tables
    const tables = await query('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Tables:', tables.rows);
    
    // Check users table structure
    const userColumns = await query('PRAGMA table_info(users)');
    console.log('Users table structure:', userColumns.rows);
    
    // Test registration process
    const User = require('./models/User');
    console.log('Testing user creation...');
    
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('User created successfully:', testUser);
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase();