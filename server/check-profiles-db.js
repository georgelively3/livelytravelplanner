const { query } = require('./config/database');

async function checkProfiles() {
  try {
    console.log('Checking traveler profiles in database...');
    const result = await query('SELECT * FROM traveler_profiles');
    console.log('Profiles found:', result.rows.length);
    console.log('Profiles:', result.rows);
    
    console.log('\nChecking if table exists...');
    const tableInfo = await query('PRAGMA table_info(traveler_profiles)');
    console.log('Table structure:', tableInfo.rows);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProfiles();