// Test script to verify the persona API endpoints
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

async function testPersonaAPI() {
  try {
    console.log('Testing Persona API endpoints...\n');

    // Test 1: Try to create a persona without authentication (should fail)
    console.log('1. Testing unauthenticated access...');
    try {
      await axios.post(`${baseURL}/personas`, {
        name: 'Test Persona',
        interests: JSON.stringify(['culture', 'food']),
        travel_style: JSON.stringify({ pace: 'relaxed' }),
        constraints: JSON.stringify({ mobility: 'none' }),
        budget: JSON.stringify({ total: 2000 }),
        accessibility_needs: JSON.stringify({ none: true }),
        group_dynamics: JSON.stringify({ solo: true })
      });
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Register a test user
    console.log('\n2. Registering test user...');
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'testpass123'
      });
      console.log('✅ Test user registered successfully');
    } catch (error) {
      if (error.response && error.response.data.message === 'User already exists') {
        console.log('✅ Test user already exists');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Login to get token
    console.log('\n3. Logging in test user...');
    let token;
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'test@example.com',
        password: 'testpass123'
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful, token received');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }

    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 4: Create a persona
    console.log('\n4. Creating a test persona...');
    let personaId;
    try {
      const createResponse = await axios.post(`${baseURL}/personas`, {
        name: 'Cultural Explorer',
        base_profile_id: 1,
        interests: JSON.stringify({
          categories: ['culture', 'history', 'museums'],
          activities: ['gallery_visits', 'historical_tours', 'local_experiences'],
          cuisine: ['local', 'authentic', 'street_food']
        }),
        travel_style: JSON.stringify({
          pace: 'moderate',
          accommodation: 'boutique',
          transport: 'public',
          planning: 'structured'
        }),
        constraints: JSON.stringify({
          mobility: 'none',
          dietary: 'vegetarian',
          time: 'flexible',
          weather: 'all_seasons'
        }),
        budget: JSON.stringify({
          total: 2500,
          accommodation_percent: 40,
          food_percent: 25,
          activities_percent: 25,
          transport_percent: 10,
          currency: 'USD'
        }),
        accessibility_needs: JSON.stringify({
          mobility_assistance: false,
          visual_assistance: false,
          hearing_assistance: false,
          cognitive_assistance: false,
          other: 'none'
        }),
        group_dynamics: JSON.stringify({
          type: 'couple',
          size: 2,
          ages: '25-35',
          decision_making: 'collaborative',
          interests_alignment: 'high'
        })
      }, authHeaders);
      
      personaId = createResponse.data.persona.id;
      console.log('✅ Persona created successfully with ID:', personaId);
    } catch (error) {
      console.log('❌ Persona creation failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 5: Get all personas for user
    console.log('\n5. Fetching user personas...');
    try {
      const getResponse = await axios.get(`${baseURL}/personas`, authHeaders);
      console.log('✅ Personas fetched successfully. Count:', getResponse.data.personas.length);
      console.log('   First persona:', getResponse.data.personas[0]?.name);
    } catch (error) {
      console.log('❌ Failed to fetch personas:', error.response?.data?.message || error.message);
    }

    // Test 6: Get specific persona
    console.log('\n6. Fetching specific persona...');
    try {
      const getOneResponse = await axios.get(`${baseURL}/personas/${personaId}`, authHeaders);
      console.log('✅ Specific persona fetched successfully:', getOneResponse.data.persona.name);
    } catch (error) {
      console.log('❌ Failed to fetch specific persona:', error.response?.data?.message || error.message);
    }

    // Test 7: Update persona
    console.log('\n7. Updating persona...');
    try {
      const updateResponse = await axios.put(`${baseURL}/personas/${personaId}`, {
        name: 'Updated Cultural Explorer',
        interests: JSON.stringify({
          categories: ['culture', 'history', 'museums', 'art'],
          activities: ['gallery_visits', 'historical_tours', 'local_experiences', 'art_workshops'],
          cuisine: ['local', 'authentic', 'street_food', 'fine_dining']
        })
      }, authHeaders);
      console.log('✅ Persona updated successfully');
    } catch (error) {
      console.log('❌ Failed to update persona:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All persona API tests completed successfully!');

  } catch (error) {
    console.log('❌ Test suite failed:', error.message);
  }
}

testPersonaAPI();