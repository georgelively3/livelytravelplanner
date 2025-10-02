describe('Trip Management Flow', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedTestData();
    cy.login(); // Login before each test
  });

  it('should create a new trip successfully', () => {
    // Navigate to create trip
    cy.contains('Create Trip').click();
    cy.url().should('include', '/create-trip');
    
    // Fill out trip form
    cy.createTrip({
      title: 'Amazing Paris Adventure',
      destination: 'Paris, France',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      travelerProfileId: '2', // Family profile
      numberOfTravelers: '4',
      budget: '3000'
    });
    
    // Should redirect to trip details or dashboard
    cy.url().should('not.include', '/create-trip');
    cy.contains('Trip created successfully').should('be.visible');
    
    // Verify trip appears in dashboard
    cy.visit('/dashboard');
    cy.contains('Amazing Paris Adventure').should('be.visible');
    cy.contains('Paris, France').should('be.visible');
  });

  it('should create trip without budget (optional field)', () => {
    cy.visit('/create-trip');
    
    cy.createTrip({
      title: 'Budget-Free Adventure',
      destination: 'London, UK',
      startDate: '2025-11-01',
      endDate: '2025-11-05',
      travelerProfileId: '1',
      numberOfTravelers: '2',
      budget: '' // No budget
    });
    
    cy.contains('Trip created successfully').should('be.visible');
    
    // Verify in dashboard
    cy.visit('/dashboard');
    cy.contains('Budget-Free Adventure').should('be.visible');
  });

  it('should show validation errors for invalid trip data', () => {
    cy.visit('/create-trip');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('Title is required').should('be.visible');
    cy.contains('Destination is required').should('be.visible');
    
    // Test invalid dates
    cy.get('input[name="title"]').type('Test Trip');
    cy.get('input[name="destination"]').type('Test Destination');
    cy.get('input[name="startDate"]').type('2025-12-05');
    cy.get('input[name="endDate"]').type('2025-12-01'); // End before start
    cy.get('button[type="submit"]').click();
    
    cy.contains('End date must be after start date').should('be.visible');
  });

  it('should display trip details correctly', () => {
    // Create a trip first
    cy.createTrip({
      title: 'Rome Exploration',
      destination: 'Rome, Italy',
      startDate: '2025-10-15',
      endDate: '2025-10-20',
      travelerProfileId: '3', // Cultural profile
      numberOfTravelers: '2',
      budget: '2500'
    });
    
    // Navigate to dashboard and click on trip
    cy.visit('/dashboard');
    cy.contains('Rome Exploration').click();
    
    // Verify trip details page
    cy.url().should('include', '/trip/');
    cy.contains('Rome Exploration').should('be.visible');
    cy.contains('Rome, Italy').should('be.visible');
    cy.contains('Oct 15, 2025').should('be.visible');
    cy.contains('Oct 20, 2025').should('be.visible');
    cy.contains('2 travelers').should('be.visible');
    cy.contains('$2,500').should('be.visible');
  });

  it('should display traveler profile information', () => {
    cy.visit('/create-trip');
    
    // Check that traveler profiles are loaded
    cy.get('select[name="travelerProfileId"]').should('exist');
    cy.get('select[name="travelerProfileId"] option').should('have.length.greaterThan', 1);
    
    // Select different profiles and verify they work
    cy.get('select[name="travelerProfileId"]').select('1');
    cy.get('select[name="travelerProfileId"]').should('have.value', '1');
    
    cy.get('select[name="travelerProfileId"]').select('3');
    cy.get('select[name="travelerProfileId"]').should('have.value', '3');
  });

  it('should handle trip list in dashboard', () => {
    // Create multiple trips
    cy.createTrip({ title: 'Trip 1', destination: 'Paris' });
    cy.visit('/dashboard');
    
    cy.createTrip({ title: 'Trip 2', destination: 'London' });
    cy.visit('/dashboard');
    
    cy.createTrip({ title: 'Trip 3', destination: 'Rome' });
    cy.visit('/dashboard');
    
    // Verify all trips appear in dashboard
    cy.contains('Trip 1').should('be.visible');
    cy.contains('Trip 2').should('be.visible');
    cy.contains('Trip 3').should('be.visible');
    cy.contains('Paris').should('be.visible');
    cy.contains('London').should('be.visible');
    cy.contains('Rome').should('be.visible');
  });

  it('should show empty state when no trips exist', () => {
    // Dashboard should show empty state for new user
    cy.visit('/dashboard');
    cy.contains('No trips yet').should('be.visible');
    cy.contains('Create your first trip').should('be.visible');
    
    // Click create trip link
    cy.contains('Create your first trip').click();
    cy.url().should('include', '/create-trip');
  });
});