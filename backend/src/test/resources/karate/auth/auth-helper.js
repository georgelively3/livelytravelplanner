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
    var signupRequest = karate.call('signup.feature', testUser);
    
    // Login and get token  
    var loginRequest = karate.call('login.feature', { 
      email: testUser.email, 
      password: testUser.password 
    });
    
    return loginRequest.response.accessToken;
  }
  
  function signupUser(userDetails) {
    karate.configure('url', karate.properties['baseUrl']);
    var response = karate.call('classpath:karate/auth/signup.feature', userDetails);
    return response;
  }
  
  function loginUser(credentials) {
    karate.configure('url', karate.properties['baseUrl']);
    var response = karate.call('classpath:karate/auth/login.feature', credentials);
    return response;
  }
  
  return {
    getAuthToken: getAuthToken,
    signupUser: signupUser,
    loginUser: loginUser
  };
}