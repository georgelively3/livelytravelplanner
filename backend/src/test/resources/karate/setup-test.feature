Feature: Karate Setup Verification

Scenario: Simple JavaScript test
  * def test = 'Hello Karate!'
  * match test == 'Hello Karate!'
  * def number = 42
  * match number == 42

Scenario: JSON manipulation test
  * def user = { name: 'John', age: 30, email: 'john@example.com' }
  * match user.name == 'John'
  * match user.age == 30
  * match user.email == 'john@example.com'
  
  * set user.age = 31
  * match user.age == 31

Scenario: Array operations test
  * def fruits = ['apple', 'banana', 'orange']
  * match fruits == ['apple', 'banana', 'orange']
  * match fruits[0] == 'apple'
  * match fruits contains 'banana'