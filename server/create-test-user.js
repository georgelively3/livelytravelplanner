const bcrypt = require('bcryptjs');
const { run, query } = require('./config/database');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = ?', ['test@test.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('Test user already exists with ID:', existingUser.rows[0].id);
      console.log('User details:', {
        id: existingUser.rows[0].id,
        email: existingUser.rows[0].email,
        firstName: existingUser.rows[0].first_name,
        lastName: existingUser.rows[0].last_name
      });
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('test1234', 10);
    
    // Create the test user
    const result = await run(`
      INSERT INTO users (email, password, first_name, last_name, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, ['test@test.com', hashedPassword, 'Test', 'User']);
    
    console.log('Test user created successfully!');
    console.log('User ID:', result.lastID);
    console.log('Email: test@test.com');
    console.log('Password: test1234');
    
    // Verify the user was created
    const newUser = await query('SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?', [result.lastID]);
    console.log('Verification - User details:', newUser.rows[0]);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();