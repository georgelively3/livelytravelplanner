function() {
  
  function generateUniqueEmail() {
    var timestamp = new Date().getTime();
    var random = Math.floor(Math.random() * 1000);
    return 'test_' + timestamp + '_' + random + '@cleanup.com';
  }
  
  function createTestUser() {
    return {
      email: generateUniqueEmail(),
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
  }
  
  function signupAndLoginUser() {
    var testUser = createTestUser();
    
    // Register user
    var signupResponse = karate.call('classpath:karate/api-calls/signup-call.feature', testUser);
    if (signupResponse.responseStatus !== 200) {
      karate.log('Signup failed:', signupResponse);
      throw new Error('User signup failed');
    }
    
    // Login and get token
    var loginResponse = karate.call('classpath:karate/api-calls/login-call.feature', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResponse.responseStatus !== 200) {
      karate.log('Login failed:', loginResponse);
      throw new Error('User login failed');
    }
    
    return {
      user: testUser,
      token: loginResponse.response.accessToken
    };
  }
  
  function cleanupTestUser(userEmail) {
    // Since we don't have a delete user API, we'll use the fact that
    // H2 in-memory database is reset between test runs
    // For now, just log the cleanup attempt
    karate.log('Test cleanup: would delete user', userEmail);
  }
  
  return {
    generateUniqueEmail: generateUniqueEmail,
    createTestUser: createTestUser,
    signupAndLoginUser: signupAndLoginUser,
    cleanupTestUser: cleanupTestUser
  };
}