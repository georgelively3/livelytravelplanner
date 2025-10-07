Feature: User Login Helper

Scenario: Login user and return token
  Given url baseUrl
  And path 'auth/signin'
  And request { email: '#(email)', password: '#(password)' }
  When method post
  Then status 200