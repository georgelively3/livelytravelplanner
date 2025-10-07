Feature: Trip API Integration Tests

Background:
  * url baseUrl
  * def randomUser = function() { return { email: 'user' + Math.floor(Math.random() * 10000) + '@test.com', password: 'Password123!', firstName: 'Test', lastName: 'User' } }
  * def authToken = call read('classpath:karate/auth/auth-helper.js')

Scenario: Get all trips without authentication fails
  Given path 'trips'
  When method get
  Then status 401

Scenario: Get all trips with authentication success
  * def token = authToken.getAuthToken()
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 200
  And match response == '#array'

Scenario: Create new trip with authentication
  * def token = authToken.getAuthToken()
  * def newTrip = 
    """
    {
      "title": "Test Trip to Paris",
      "description": "A wonderful test trip to the City of Light",
      "startDate": "2025-06-01",
      "endDate": "2025-06-07",
      "destination": "Paris, France",
      "budget": 2500.00
    }
    """
  
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  And request newTrip
  When method post
  Then status 201
  And match response.title == 'Test Trip to Paris'
  And match response.destination == 'Paris, France'
  And match response.id == '#number'

Scenario: Create trip without authentication fails
  * def newTrip = { "title": "Unauthorized Trip", "destination": "Nowhere" }
  Given path 'trips'
  And request newTrip
  When method post
  Then status 401

Scenario: Create trip with invalid data fails
  * def token = authToken.getAuthToken()
  * def invalidTrip = { "title": "", "destination": "" }
  
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  And request invalidTrip
  When method post
  Then status 400

Scenario: Get specific trip by ID
  * def token = authToken.getAuthToken()
  * def tripData = 
    """
    {
      "title": "Get Trip Test",
      "description": "Trip for testing GET by ID",
      "startDate": "2025-07-01",
      "endDate": "2025-07-07",
      "destination": "Tokyo, Japan",
      "budget": 3000.00
    }
    """
  
  # Create trip first
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  And request tripData
  When method post
  Then status 201
  * def tripId = response.id
  
  # Get the created trip
  Given path 'trips', tripId
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 200
  And match response.title == 'Get Trip Test'
  And match response.id == tripId

Scenario: Update existing trip
  * def token = authToken.getAuthToken()
  * def originalTrip = 
    """
    {
      "title": "Original Trip",
      "description": "Original description",
      "startDate": "2025-08-01",
      "endDate": "2025-08-07",
      "destination": "Rome, Italy",
      "budget": 2000.00
    }
    """
  
  # Create trip
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  And request originalTrip
  When method post
  Then status 201
  * def tripId = response.id
  
  # Update trip
  * def updatedTrip = 
    """
    {
      "title": "Updated Trip Title",
      "description": "Updated description",
      "startDate": "2025-08-01",
      "endDate": "2025-08-10",
      "destination": "Rome, Italy",
      "budget": 2500.00
    }
    """
  
  Given path 'trips', tripId
  And header Authorization = 'Bearer ' + token
  And request updatedTrip
  When method put
  Then status 200
  And match response.title == 'Updated Trip Title'
  And match response.budget == 2500.00

Scenario: Delete existing trip
  * def token = authToken.getAuthToken()
  * def tripToDelete = 
    """
    {
      "title": "Trip to Delete",
      "description": "This trip will be deleted",
      "startDate": "2025-09-01",
      "endDate": "2025-09-07",
      "destination": "Barcelona, Spain",
      "budget": 1800.00
    }
    """
  
  # Create trip
  Given path 'trips'
  And header Authorization = 'Bearer ' + token
  And request tripToDelete
  When method post
  Then status 201
  * def tripId = response.id
  
  # Delete trip
  Given path 'trips', tripId
  And header Authorization = 'Bearer ' + token
  When method delete
  Then status 204
  
  # Verify trip is deleted
  Given path 'trips', tripId
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 404