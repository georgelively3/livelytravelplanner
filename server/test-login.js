const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const loginData = {
      email: 'newuser1759432354847@example.com',
      password: 'password123'
    };
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      timeout: 5000
    });
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('Login failed!');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', error.response.data);
    }
  }
}

testLogin();