Feature: User Signup Helper

Scenario: Register a new user
  Given url baseUrl
  And path 'auth/signup'
  And request __arg
  When method post
  Then status 200