// Simple test script to verify basic API connectivity
const https = require('https');
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testBasicAPI() {
  console.log('Testing basic API connectivity...\n');
  
  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server connectivity...');
    const profilesResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/profiles',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Server is responding. Status:', profilesResponse.status);
    console.log('   Profiles count:', profilesResponse.data.profiles?.length || 'N/A');
    
    // Test 2: Test registration
    console.log('\n2. Testing user registration...');
    const registrationResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    console.log('Registration status:', registrationResponse.status);
    console.log('Registration response:', registrationResponse.data);
    
    if (registrationResponse.status === 400 && registrationResponse.data.message === 'User already exists') {
      console.log('✅ User already exists - this is expected');
    } else if (registrationResponse.status === 201) {
      console.log('✅ User registered successfully');
    } else {
      console.log('❌ Unexpected registration response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicAPI();