// Custom commands for Travel Planner E2E tests

Cypress.Commands.add('login', (email = 'test@test.com', password = 'test1234') => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/');
});

Cypress.Commands.add('register', (userData) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const user = { ...defaultData, ...userData };
  
  cy.visit('/register');
  cy.get('input[name="firstName"]').type(user.firstName);
  cy.get('input[name="lastName"]').type(user.lastName);
  cy.get('input[name="email"]').type(user.email);
  cy.get('input[name="password"]').type(user.password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('createTrip', (tripData) => {
  const defaultTrip = {
    title: 'Test Trip',
    destination: 'Paris, France',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    travelerProfileId: '1',
    numberOfTravelers: '2',
    budget: '1500'
  };
  
  const trip = { ...defaultTrip, ...tripData };
  
  cy.visit('/create-trip');
  cy.get('input[name="title"]').type(trip.title);
  cy.get('input[name="destination"]').type(trip.destination);
  cy.get('input[name="startDate"]').type(trip.startDate);
  cy.get('input[name="endDate"]').type(trip.endDate);
  cy.get('select[name="travelerProfileId"]').select(trip.travelerProfileId);
  cy.get('input[name="numberOfTravelers"]').clear().type(trip.numberOfTravelers);
  
  if (trip.budget) {
    cy.get('input[name="budget"]').type(trip.budget);
  }
  
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('cleanDatabase', () => {
  cy.request('DELETE', `${Cypress.env('apiUrl')}/api/test/clean-database`);
});

Cypress.Commands.add('seedTestData', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/test/seed-data`);
});