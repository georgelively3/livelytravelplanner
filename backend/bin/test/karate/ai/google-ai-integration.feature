Feature: Google AI Integration Testing
  Background:
    * url 'http://localhost:8080'
    * header Accept = 'application/json'
    * header Content-Type = 'application/json'

  Scenario: Test AI trip plan generation works regardless of Google AI configuration
    Given def travelerProfile =
      """
      {
        "id": 1,
        "name": "AI Integration Tester",
        "interests": ["outdoor", "hiking", "local cuisine"],
        "budget": "moderate"
      }
      """
    And def tripParameters =
      """
      {
        "destination": "Oaxaca",
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
    And match response.destination == 'Oaxaca'
    And match response.dailyItineraries == '#[3]'
    # Verify each day has an itinerary
    And match response.dailyItineraries[0].day == 'Day 1'
    And match response.dailyItineraries[1].day == 'Day 2' 
    And match response.dailyItineraries[2].day == 'Day 3'
    # Verify itinerary contains plans for Oaxaca
    And match response.dailyItineraries[0].activities == '#present'
    And match response.dailyItineraries[0].activities[0].location contains 'Oaxaca'
    # Verify the response contains actual content (not empty)
    And match response.dailyItineraries[0].activities[0].name == '#present'
    And match response.dailyItineraries[0].activities[0].description == '#present'
    # Verify AI model is specified (could be Google AI or Fallback)
    And match response.aiModel == '#present'
    And match response.generatedAt == '#present'

  Scenario: Test AI trip plan with budget as integer vs double
    Given def travelerProfile =
      """
      {
        "id": 2,
        "name": "Budget Tester",
        "interests": ["culture", "museums"],
        "budget": "luxury"
      }
      """
    And def tripParametersIntBudget =
      """
      {
        "destination": "Bangkok",
        "startDate": "2025-11-01",
        "endDate": "2025-11-03",
        "duration": 3,
        "budget": 2000,
        "interests": ["culture", "museums"]
      }
      """
    When path '/api/ai/trip-plan'
    And request { travelerProfile: '#(travelerProfile)', tripParameters: '#(tripParametersIntBudget)' }
    And method post
    Then status 200
    And match response.success == true
    And match response.destination == 'Bangkok'
    And match response.totalBudget == 2000.0
    And match response.dailyItineraries == '#[3]'

  Scenario: Test AI response structure consistency 
    Given def travelerProfile =
      """
      {
        "id": 3,
        "name": "Structure Tester",
        "interests": ["beach", "relaxation"],
        "budget": "budget"
      }
      """
    And def tripParameters =
      """
      {
        "destination": "Bali",
        "startDate": "2025-12-01",
        "endDate": "2025-12-03",
        "duration": 3,
        "budget": 1200.50,
        "interests": ["beach", "relaxation"]
      }
      """
    When path '/api/ai/trip-plan'
    And request { travelerProfile: '#(travelerProfile)', tripParameters: '#(tripParameters)' }
    And method post
    Then status 200
    # Verify complete response structure
    And match response == 
      """
      {
        "success": true,
        "destination": "Bali",
        "duration": 3,
        "startDate": "2025-12-01",
        "endDate": "2025-12-03",
        "totalBudget": 1200.5,
        "dailyItineraries": "#[3]",
        "generatedAt": "#present",
        "aiModel": "#present"
      }
      """
    # Verify daily itinerary structure
    And match each response.dailyItineraries ==
      """
      {
        "day": "#present",
        "date": "#present", 
        "activities": "#present"
      }
      """
    # Verify activity structure
    And match each response.dailyItineraries[0].activities ==
      """
      {
        "name": "#present",
        "description": "#present",
        "type": "#present",
        "location": "#present", 
        "startTime": "#present",
        "endTime": "#present",
        "estimatedCost": "#present",
        "duration": "#present"
      }
      """