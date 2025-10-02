const axios = require('axios');

async function debugTripCreation() {
  try {
    console.log('=== DEBUGGING TRIP CREATION FLOW ===\n');
    
    // Step 1: Check available traveler profiles
    console.log('1. Checking available traveler profiles...');
    const profilesResponse = await axios.get('http://localhost:5000/api/profiles');
    console.log('✅ Profiles loaded:', profilesResponse.data.length, 'profiles');
    profilesResponse.data.forEach(profile => {
      console.log(`   - ID ${profile.id}: ${profile.name}`);
    });
    
    // Step 2: Login with test user
    console.log('\n2. Logging in with test user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'test1234'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log('   User ID:', userId);
    console.log('   Token:', token.substring(0, 30) + '...');
    
    // Step 3: Try to create trip (simulate form submission)
    console.log('\n3. Creating trip (simulating frontend form)...');
    
    const tripData = {
      title: 'My Awesome Trip',
      destination: 'Tokyo, Japan',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      travelerProfileId: 1, // Use first available profile
      numberOfTravelers: 2,
      budget: 3000
    };
    
    console.log('Trip data being sent:', tripData);
    
    const tripResponse = await axios.post('http://localhost:5000/api/trips', tripData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000 // Give it more time for itinerary generation
    });
    
    console.log('✅ Trip created successfully!');
    console.log('   Trip ID:', tripResponse.data.id);
    console.log('   Title:', tripResponse.data.title);
    console.log('   Days in itinerary:', tripResponse.data.itinerary?.length || 0);
    
    // Step 4: Verify trip was saved
    console.log('\n4. Verifying trip was saved...');
    const savedTripResponse = await axios.get(`http://localhost:5000/api/trips/${tripResponse.data.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Trip verification successful');
    console.log('   Saved trip title:', savedTripResponse.data.title);
    
    return tripResponse.data;
    
  } catch (error) {
    console.log('\n❌ ERROR OCCURRED:');
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('HTTP Status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received. Request details:');
      console.log('URL:', error.config?.url);
      console.log('Method:', error.config?.method);
      console.log('Headers:', error.config?.headers);
    } else {
      console.log('Request setup error:', error.message);
    }
    
    // Additional debugging info
    console.log('\nFull error object:');
    console.log(error);
  }
}

// Also test profiles endpoint directly
async function testProfilesEndpoint() {
  try {
    console.log('\n=== TESTING PROFILES ENDPOINT ===');
    const response = await axios.get('http://localhost:5000/api/profiles');
    console.log('Profiles response:', response.data);
  } catch (error) {
    console.log('Profiles endpoint error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// Run both tests
async function runTests() {
  await testProfilesEndpoint();
  await debugTripCreation();
}

runTests();