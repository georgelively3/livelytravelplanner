// BROWSER CONSOLE DEBUGGING SCRIPT
// Copy and paste this into your browser console when you're on the Create Trip page

console.log('=== TRIP CREATION DEBUG SCRIPT ===');

// Check if user is authenticated
const token = localStorage.getItem('token');
console.log('1. Authentication Check:');
console.log('Token exists:', !!token);
console.log('Token value:', token ? token.substring(0, 30) + '...' : 'No token');

// Check axios default headers
console.log('\n2. Axios Configuration:');
console.log('Default Authorization header:', axios.defaults.headers.common['Authorization']);

// Test backend connectivity
console.log('\n3. Testing Backend Connectivity...');

// Test health endpoint
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend health check:', data);
  })
  .catch(error => {
    console.log('❌ Backend health check failed:', error);
  });

// Test profiles endpoint (should work without auth)
fetch('/api/profiles')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Profiles endpoint (via proxy):', data.length, 'profiles');
  })
  .catch(error => {
    console.log('❌ Profiles endpoint failed:', error);
  });

// Test authenticated endpoint
if (token) {
  fetch('/api/trips', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  })
  .then(data => {
    console.log('✅ Authenticated trips endpoint:', data);
  })
  .catch(error => {
    console.log('❌ Authenticated trips endpoint failed:', error);
  });
}

// Function to test trip creation manually
window.testTripCreation = function() {
  console.log('\n4. Manual Trip Creation Test...');
  
  const tripData = {
    title: 'Console Test Trip',
    destination: 'Test City',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    travelerProfileId: 1,
    numberOfTravelers: 2,
    budget: 1000
  };
  
  console.log('Sending trip data:', tripData);
  
  fetch('/api/trips', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tripData)
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      return response.json();
    } else {
      return response.text().then(text => {
        throw new Error(`HTTP ${response.status}: ${text}`);
      });
    }
  })
  .then(data => {
    console.log('✅ Manual trip creation successful:', data);
  })
  .catch(error => {
    console.log('❌ Manual trip creation failed:', error);
  });
};

console.log('\n5. Manual Test Function Available');
console.log('Run: testTripCreation() to test trip creation manually');

// Check form data if on Create Trip page
setTimeout(() => {
  const titleInput = document.querySelector('input[label="Trip Title"], input[placeholder*="Trip"], input[id*="title"]');
  const destInput = document.querySelector('input[label="Destination"], input[placeholder*="destination"]');
  
  if (titleInput || destInput) {
    console.log('\n6. Form Elements Found:');
    console.log('Title input:', titleInput?.value || 'Not found');
    console.log('Destination input:', destInput?.value || 'Not found');
  }
}, 1000);

console.log('\n=== DEBUG SCRIPT COMPLETE ===');
console.log('Check the console output above for any issues');
console.log('If everything looks good, the issue might be in form validation or submission logic');