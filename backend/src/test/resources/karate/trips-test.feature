Feature: Trips API Test

Background:
  * url baseUrl
  * def testHelpers = karate.call('classpath:karate/test-helpers.js')
  
  # Register and login a user first to get auth token
  * def testUser = testHelpers.createTestUser()
  Given path 'auth/signup'
  And request testUser
  When method post
  Then status 200
  
  * def loginRequest = { email: '#(testUser.email)', password: '#(testUser.password)' }
  Given path 'auth/signin'
  And request loginRequest
  When method post
  Then status 200
  * def authToken = response.accessToken

Scenario: Create a new trip
  * def newTrip = { name: 'Paris Vacation', description: 'A wonderful trip to Paris', startDate: '2024-12-01', endDate: '2024-12-07', destination: 'Paris, France' }
  Given path 'trips'
  And header Authorization = 'Bearer ' + authToken
  And request newTrip
  When method post
  Then status 201
  And match response.name == 'Paris Vacation'
  And match response.description == 'A wonderful trip to Paris'
  And match response.destination == 'Paris, France'
  And match response.id != null
  
  # Log cleanup for this test user
  * karate.log('Test completed for user:', testUser.email)

Scenario: Get trips for authenticated user
  Given path 'trips'
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response == '#array'
  
  # Log cleanup for this test user
  * karate.log('Test completed for user:', testUser.email)