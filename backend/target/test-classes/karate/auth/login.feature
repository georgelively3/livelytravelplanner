Feature: User Login Helper

Scenario: Login user and return token
  Given url baseUrl
  And path 'auth/signin'
  And request __arg
  When method post
  Then status 200