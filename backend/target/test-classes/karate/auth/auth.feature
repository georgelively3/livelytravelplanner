Feature: Authentication API Integration Tests

Background:
  * url baseUrl
  * def randomUser = function() { return { email: 'user' + Math.floor(Math.random() * 10000) + '@test.com', password: 'Password123!', firstName: 'Test', lastName: 'User' } }

Scenario: Health check endpoint
  Given path 'health'
  When method get
  Then status 200
  And match response.status == 'UP'
  And match response.service == 'Travel Planner Backend'

Scenario: User registration success
  * def newUser = randomUser()
  Given path 'auth/signup'
  And request newUser
  When method post
  Then status 200
  And match response == { message: 'User registered successfully!' }

Scenario: User registration with duplicate email fails
  * def duplicateUser = randomUser()
  # First registration
  Given path 'auth/signup'
  And request duplicateUser
  When method post
  Then status 200
  
  # Second registration with same email should fail
  Given path 'auth/signup'
  And request duplicateUser
  When method post
  Then status 400
  And match response.message == 'Error: Email is already in use!'

Scenario: User registration with invalid email fails
  Given path 'auth/signup'
  And request { email: 'invalid-email', password: 'Password123!', firstName: 'Test', lastName: 'User' }
  When method post
  Then status 400

Scenario: User registration with weak password fails
  Given path 'auth/signup'
  And request { email: 'test@example.com', password: '123', firstName: 'Test', lastName: 'User' }
  When method post
  Then status 400

Scenario: User login success
  * def loginUser = randomUser()
  # Register user first
  Given path 'auth/signup'
  And request loginUser
  When method post
  Then status 200
  
  # Login with registered user
  Given path 'auth/signin'
  And request { email: '#(loginUser.email)', password: '#(loginUser.password)' }
  When method post
  Then status 200
  And match response.accessToken == '#string'
  And match response.tokenType == 'Bearer'
  And match response.email == loginUser.email

Scenario: User login with invalid credentials fails
  Given path 'auth/signin'
  And request { email: 'nonexistent@test.com', password: 'wrongpassword' }
  When method post
  Then status 401
  And match response.message == 'Bad credentials'

Scenario: User login with empty credentials fails
  Given path 'auth/signin'
  And request { email: '', password: '' }
  When method post
  Then status 400