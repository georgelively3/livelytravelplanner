function() {
  
  function getAuthToken() {
    var randomEmail = 'user' + Math.floor(Math.random() * 10000) + '@test.com';
    var testUser = {
      email: randomEmail,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    // Register user
    var signupResponse = karate.call('classpath:karate/auth/signup.feature', testUser);
    
    // Login and get token  
    var loginResponse = karate.call('classpath:karate/auth/login.feature', { 
      email: testUser.email, 
      password: testUser.password 
    });
    
    return loginResponse.response.accessToken;
  }
  
  return {
    getAuthToken: getAuthToken
  };
}