const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration API with new user...');
    
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: `newuser${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      timeout: 5000
    });
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('Registration failed!');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received from server');
    } else {
      console.log('Error setting up the request:', error.message);
    }
  }
}

testRegistration();