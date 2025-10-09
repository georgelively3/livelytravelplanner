Feature: Simple Health Test

Background:
  * url baseUrl

Scenario: Health check endpoint
  Given path 'health'
  When method get
  Then status 200
  And match response.status == 'UP'
  And match response.service == 'Travel Planner Backend'