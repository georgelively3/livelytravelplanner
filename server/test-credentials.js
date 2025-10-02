const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with test credentials...');
    
    const loginData = {
      email: 'test@test.com',
      password: 'test1234'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      timeout: 5000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('User data:', response.data.user);
    console.log('Token:', response.data.token.substring(0, 50) + '...');
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    
    return null;
  }
}

async function testRegistration() {
  try {
    console.log('\nTesting registration (should fail - user exists)...');
    
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'test1234'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      timeout: 5000
    });
    
    console.log('Registration response:', response.data);
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Expected error: User already exists -', error.response.data.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

async function runTests() {
  await testLogin();
  await testRegistration();
}

runTests();