const axios = require('axios');

async function testNewUserFlow() {
  try {
    console.log('=== TESTING NEW USER REGISTRATION + TRIP CREATION ===\n');
    
    // Create a unique email for testing
    const timestamp = Date.now();
    const testEmail = `newuser${timestamp}@example.com`;
    
    console.log('1. Registering new user...');
    console.log('Email:', testEmail);
    
    const registrationData = {
      firstName: 'New',
      lastName: 'User',
      email: testEmail,
      password: 'password123'
    };
    
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registrationData);
    console.log('✅ Registration successful');
    console.log('New user ID:', registerResponse.data.user.id);
    console.log('Token received:', registerResponse.data.token.substring(0, 30) + '...');
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    
    // Immediately try to create a trip with the new user
    console.log('\n2. Creating trip with newly registered user...');
    
    const tripData = {
      title: 'New User First Trip',
      destination: 'Barcelona, Spain',
      startDate: '2025-11-15',
      endDate: '2025-11-20',
      travelerProfileId: 2, // Family profile
      numberOfTravelers: 3,
      budget: 2500
    };
    
    console.log('Trip data:', tripData);
    console.log('Using token:', token.substring(0, 30) + '...');
    
    const tripResponse = await axios.post('http://localhost:5000/api/trips', tripData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Trip creation successful with new user!');
    console.log('Trip ID:', tripResponse.data.id);
    console.log('Trip title:', tripResponse.data.title);
    console.log('User ID in trip:', tripResponse.data.user_id);
    console.log('Itinerary days:', tripResponse.data.itinerary?.length);
    
    // Verify the trip belongs to the correct user
    if (tripResponse.data.user_id === userId) {
      console.log('✅ Trip correctly associated with new user');
    } else {
      console.log('❌ Trip associated with wrong user!');
      console.log('Expected user ID:', userId);
      console.log('Actual user ID in trip:', tripResponse.data.user_id);
    }
    
    return { success: true, tripId: tripResponse.data.id };
    
  } catch (error) {
    console.log('\n❌ ERROR in new user flow:');
    console.log('Step failed at:', error.config?.url);
    console.log('Method:', error.config?.method);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('HTTP Status:', error.response.status);
      console.log('Response data:', error.response.data);
      
      // Check for specific validation errors
      if (error.response.data?.errors) {
        console.log('Validation errors:');
        error.response.data.errors.forEach(err => {
          console.log(`  - ${err.path}: ${err.msg}`);
        });
      }
    } else if (error.request) {
      console.log('No response received');
      console.log('Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }
    
    return { success: false, error: error.message };
  }
}

// Test the flow
testNewUserFlow();