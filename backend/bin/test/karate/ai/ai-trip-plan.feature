Feature: AI Trip Plan Generation
  Background:
    * url 'http://localhost:8080'
    * header Accept = 'application/json'
    * header Content-Type = 'application/json'

  Scenario: Test AI retrieval based on a traveler profile and trip parameters
    Given def travelerProfile =
      """
      {
        "id": 1,
        "name": "Adventure Seeker",
        "interests": ["outdoor", "hiking", "local cuisine"],
        "budget": "moderate"
      }
      """
    And def tripParameters =
      """
      {
        "destination": "Lisbon",
        "startDate": "2025-10-15",
        "endDate": "2025-10-17",
        "duration": 3,
        "budget": 1500.00,
        "interests": ["outdoor", "hiking", "local cuisine"]
      }
      """
    When path '/api/ai/trip-plan'
    And request { travelerProfile: '#(travelerProfile)', tripParameters: '#(tripParameters)' }
    And method post
    Then status 200
    And match response.success == true
    And match response.destination == 'Lisbon'
    And match response.dailyItineraries == '#[3]'
    # Verify each day has an itinerary
    And match response.dailyItineraries[0].day == 'Day 1'
    And match response.dailyItineraries[1].day == 'Day 2' 
    And match response.dailyItineraries[2].day == 'Day 3'
    # Verify itinerary contains plans for Lisbon
    And match response.dailyItineraries[0].activities == '#present'
    And match response.dailyItineraries[0].activities[0].location contains 'Lisbon'
    # Verify itinerary suggests restaurants
    And match response.dailyItineraries[*].activities[?(@.type == 'restaurant')] == '#present'
    # Verify the response contains actual content (not empty)
    And match response.dailyItineraries[0].activities[0].name == '#present'
    And match response.dailyItineraries[0].activities[0].description == '#present'

  Scenario: Test AI trip plan with different destination
    Given def travelerProfile =
      """
      {
        "id": 2,
        "name": "Culture Enthusiast", 
        "interests": ["museums", "art", "history"],
        "budget": "luxury"
      }
      """
    And def tripParameters =
      """
      {
        "destination": "Paris",
        "startDate": "2025-11-01",
        "endDate": "2025-11-03",
        "duration": 3,
        "budget": 2500.00,
        "interests": ["museums", "art", "history"]
      }
      """
    When path '/api/ai/trip-plan'
    And request { travelerProfile: '#(travelerProfile)', tripParameters: '#(tripParameters)' }
    And method post
    Then status 200
    And match response.success == true
    And match response.destination == 'Paris'
    And match response.dailyItineraries == '#[3]'
    # Verify Paris-specific content
    And match response.dailyItineraries[*].activities[*].location contains 'Paris'
    # Verify cultural activities based on interests
    And match response.dailyItineraries[*].activities[?(@.type == 'museum' || @.type == 'cultural')] == '#present'