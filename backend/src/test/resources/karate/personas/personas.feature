Feature: Personas API Integration Tests

Background:
  * url baseUrl
  * def randomUser = function() { return { email: 'user' + Math.floor(Math.random() * 10000) + '@test.com', password: 'Password123!', firstName: 'Test', lastName: 'User' } }
  * def authToken = call read('classpath:karate/auth/auth-helper.js')

Scenario: Get user personas without authentication fails
  Given path 'personas'
  When method get
  Then status 401

Scenario: Get user personas with authentication (empty initially)
  * def token = authToken.getAuthToken()
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 200
  And match response == '#array'
  And match response == []

Scenario: Create new persona with authentication
  * def token = authToken.getAuthToken()
  * def newPersona = 
    """
    {
      "name": "Adventure Seeker",
      "description": "Loves outdoor activities and extreme sports",
      "preferences": {
        "activities": ["hiking", "rock climbing", "white water rafting"],
        "accommodation": "camping",
        "budget": "medium",
        "travelStyle": "adventurous"
      }
    }
    """
  
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  And request newPersona
  When method post
  Then status 201
  And match response.name == 'Adventure Seeker'
  And match response.description == 'Loves outdoor activities and extreme sports'
  And match response.id == '#number'

Scenario: Create persona without authentication fails
  * def newPersona = { "name": "Unauthorized Persona", "description": "Should fail" }
  Given path 'personas'
  And request newPersona
  When method post
  Then status 401

Scenario: Create persona with invalid data fails
  * def token = authToken.getAuthToken()
  * def invalidPersona = { "name": "", "description": "" }
  
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  And request invalidPersona
  When method post
  Then status 400

Scenario: Get specific persona by ID
  * def token = authToken.getAuthToken()
  * def personaData = 
    """
    {
      "name": "Cultural Explorer",
      "description": "Enjoys museums, local cuisine, and historical sites",
      "preferences": {
        "activities": ["museums", "food tours", "historical sites"],
        "accommodation": "hotel",
        "budget": "high",
        "travelStyle": "cultural"
      }
    }
    """
  
  # Create persona first
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  And request personaData
  When method post
  Then status 201
  * def personaId = response.id
  
  # Get the created persona
  Given path 'personas', personaId
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 200
  And match response.name == 'Cultural Explorer'
  And match response.id == personaId

Scenario: Update existing persona
  * def token = authToken.getAuthToken()
  * def originalPersona = 
    """
    {
      "name": "Original Persona",
      "description": "Original description",
      "preferences": {
        "activities": ["swimming"],
        "accommodation": "hotel",
        "budget": "low",
        "travelStyle": "relaxed"
      }
    }
    """
  
  # Create persona
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  And request originalPersona
  When method post
  Then status 201
  * def personaId = response.id
  
  # Update persona
  * def updatedPersona = 
    """
    {
      "name": "Updated Persona",
      "description": "Updated description with new interests",
      "preferences": {
        "activities": ["swimming", "spa", "yoga"],
        "accommodation": "resort",
        "budget": "high",
        "travelStyle": "luxury"
      }
    }
    """
  
  Given path 'personas', personaId
  And header Authorization = 'Bearer ' + token
  And request updatedPersona
  When method put
  Then status 200
  And match response.name == 'Updated Persona'
  And match response.description == 'Updated description with new interests'

Scenario: Delete existing persona
  * def token = authToken.getAuthToken()
  * def personaToDelete = 
    """
    {
      "name": "Persona to Delete",
      "description": "This persona will be deleted",
      "preferences": {
        "activities": ["reading"],
        "accommodation": "any",
        "budget": "low",
        "travelStyle": "quiet"
      }
    }
    """
  
  # Create persona
  Given path 'personas'
  And header Authorization = 'Bearer ' + token
  And request personaToDelete
  When method post
  Then status 201
  * def personaId = response.id
  
  # Delete persona
  Given path 'personas', personaId
  And header Authorization = 'Bearer ' + token
  When method delete
  Then status 204
  
  # Verify persona is deleted
  Given path 'personas', personaId
  And header Authorization = 'Bearer ' + token
  When method get
  Then status 404