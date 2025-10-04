// Test authentication from frontend context
console.log('Testing authentication...');

// Test registration
async function testRegistration() {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Frontend',
        lastName: 'Test',
        email: 'frontend@test.com',
        password: 'testpass123'
      })
    });
    
    const data = await response.json();
    console.log('Registration Response:', response.status, data);
    
    if (response.ok) {
      console.log('✅ Registration successful from frontend');
      return data.token;
    } else {
      console.log('❌ Registration failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return null;
  }
}

// Test login
async function testLogin() {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'frontend@test.com',
        password: 'testpass123'
      })
    });
    
    const data = await response.json();
    console.log('Login Response:', response.status, data);
    
    if (response.ok) {
      console.log('✅ Login successful from frontend');
      return data.token;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// Run tests
(async () => {
  console.log('🚀 Starting frontend authentication tests...');
  
  const token = await testRegistration();
  if (token) {
    await testLogin();
  }
  
  console.log('✨ Tests complete!');
})();