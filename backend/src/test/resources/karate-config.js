function fn() {
  var env = karate.env; // get system property 'karate.env'
  karate.log('karate.env system property was:', env);
  
  if (!env) {
    env = 'dev';
  }
  
  var config = {
    env: env,
    baseUrl: 'http://localhost:8080/api',
    testUser: {
      email: 'test@travelplanner.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    },
    adminUser: {
      email: 'admin@travelplanner.com', 
      password: 'AdminPassword123!',
      firstName: 'Admin',
      lastName: 'User'
    }
  };
  
  if (env == 'dev') {
    config.baseUrl = 'http://localhost:8080/api';
  } else if (env == 'qa') {
    config.baseUrl = 'http://qa-server:8080/api';
  } else if (env == 'prod') {
    config.baseUrl = 'https://api.travelplanner.com/api';
  }
  
  karate.log('Final config:', config);
  return config;
}