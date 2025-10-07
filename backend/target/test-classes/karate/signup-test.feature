Feature: User Registration Test

Background:
  * url baseUrl
  * def testHelpers = karate.call('classpath:karate/test-helpers.js')

Scenario: User registration success
  * def newUser = testHelpers.createTestUser()
  Given path 'auth/signup'
  And request newUser
  When method post
  Then status 200
  And match response.message == 'User registered successfully!'
  
  # Log cleanup for this test user
  * karate.log('Test completed for user:', newUser.email)

Scenario: User registration with duplicate email fails
  * def duplicateUser = testHelpers.createTestUser()
  Given path 'auth/signup'
  And request duplicateUser
  When method post
  Then status 200
  # Register the same user again
  Given path 'auth/signup'
  And request duplicateUser
  When method post
  Then status 400
  And match response.message == 'Error: Email is already in use!'
  
  # Log cleanup for this test user
  * karate.log('Test completed for duplicate user:', duplicateUser.email)