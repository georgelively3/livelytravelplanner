const axios = require('axios');

async function testTripCreation() {
  try {
    console.log('Testing trip creation with test user...');
    
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'test1234'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // Now create a trip
    console.log('2. Creating trip...');
    const tripData = {
      title: 'Test Trip to Paris',
      destination: 'Paris, France',
      startDate: '2025-11-01',
      endDate: '2025-11-05',
      travelerProfileId: 1, // Assuming profile ID 1 exists
      numberOfTravelers: 2,
      budget: 2000
    };
    
    const tripResponse = await axios.post('http://localhost:5000/api/trips', tripData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Trip created successfully!');
    console.log('Trip ID:', tripResponse.data.id);
    console.log('Title:', tripResponse.data.title);
    console.log('Destination:', tripResponse.data.destination);
    console.log('Number of itinerary days:', tripResponse.data.itinerary?.length || 0);
    
    if (tripResponse.data.itinerary) {
      tripResponse.data.itinerary.forEach(day => {
        console.log(`Day ${day.day_number}: ${day.activities?.length || 0} activities`);
      });
    }
    
  } catch (error) {
    console.log('❌ Trip creation failed!');
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('No response received from server');
    }
    
    console.log('Full error:', error);
  }
}

testTripCreation();