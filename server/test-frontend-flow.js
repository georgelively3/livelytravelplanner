const axios = require('axios');

async function testFrontendFlow() {
  try {
    console.log('=== SIMULATING FRONTEND TRIP CREATION ===\n');
    
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'test1234'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test 1: Simulate what frontend might send with Date objects
    console.log('\n2. Testing with Date object conversion (like frontend)...');
    
    // Simulate frontend date handling
    const startDate = new Date('2025-12-01');
    const endDate = new Date('2025-12-05');
    
    const frontendTripData = {
      title: 'Frontend Test Trip',
      destination: 'Paris, France',
      startDate: startDate.toISOString().split('T')[0], // This is what frontend does
      endDate: endDate.toISOString().split('T')[0],
      travelerProfileId: 1,
      numberOfTravelers: 2,
      budget: 1500
    };
    
    console.log('Sending trip data:', frontendTripData);
    
    const tripResponse = await axios.post('http://localhost:5000/api/trips', frontendTripData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Frontend-style trip creation successful!');
    console.log('Trip ID:', tripResponse.data.id);
    
    // Test 2: Test with missing or invalid fields
    console.log('\n3. Testing with potential validation issues...');
    
    const invalidTripData = {
      title: '',  // Empty title
      destination: 'London',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      travelerProfileId: '', // Empty profile ID
      numberOfTravelers: 1,
      budget: ''
    };
    
    try {
      await axios.post('http://localhost:5000/api/trips', invalidTripData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (validationError) {
      console.log('✅ Expected validation error caught:');
      console.log('Status:', validationError.response?.status);
      console.log('Message:', validationError.response?.data?.message);
      console.log('Errors:', validationError.response?.data?.errors);
    }
    
    // Test 3: Test without authentication
    console.log('\n4. Testing without authentication...');
    
    try {
      await axios.post('http://localhost:5000/api/trips', frontendTripData);
    } catch (authError) {
      console.log('✅ Expected auth error caught:');
      console.log('Status:', authError.response?.status);
      console.log('Message:', authError.response?.data?.message);
    }
    
  } catch (error) {
    console.log('\n❌ Unexpected error:');
    console.log('Message:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testFrontendFlow();