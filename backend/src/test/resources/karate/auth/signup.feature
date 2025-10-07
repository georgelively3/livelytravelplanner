Feature: User Signup Helper

Scenario: Register a new user
  Given url baseUrl
  And path 'auth/signup'
  And request { email: '#(email)', password: '#(password)', firstName: '#(firstName)', lastName: '#(lastName)' }
  When method post
  Then status 200