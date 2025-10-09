Feature: User Login Test

Background:
  * url baseUrl
  * def testHelpers = karate.call('classpath:karate/test-helpers.js')

Scenario: User login success
  # First register a user
  * def testUser = testHelpers.createTestUser()
  Given path 'auth/signup'
  And request testUser
  When method post
  Then status 200
  
  # Now login with the same user
  * def loginRequest = { email: '#(testUser.email)', password: '#(testUser.password)' }
  Given path 'auth/signin'
  And request loginRequest
  When method post
  Then status 200
  And match response.accessToken != null
  And match response.email == testUser.email
  
  # Log cleanup for this test user
  * karate.log('Test completed for user:', testUser.email)

Scenario: User login with invalid credentials fails
  * def invalidLogin = { email: 'nonexistent@example.com', password: 'WrongPassword!' }
  Given path 'auth/signin'
  And request invalidLogin
  When method post
  Then status 401
  And match response.message == 'Error: Invalid credentials!'