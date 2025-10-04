const axios = require('axios');

async function testProfiles() {
  try {
    console.log('Testing /api/profiles endpoint...');
    const response = await axios.get('http://localhost:5000/api/profiles');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error details:', error.code);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is the server running on port 5000?');
    }
  }
}

testProfiles();