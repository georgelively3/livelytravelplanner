describe('User Authentication Flow', () => {
  beforeEach(() => {
    // Clean database before each test
    cy.cleanDatabase();
    cy.seedTestData();
  });

  it('should complete the full user registration and login flow', () => {
    // Test Registration
    cy.visit('/');
    cy.contains('Get Started').click();
    cy.url().should('include', '/register');
    
    // Fill registration form
    cy.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    
    // Should redirect to login after registration
    cy.url().should('include', '/login');
    cy.contains('Registration successful').should('be.visible');
    
    // Test Login
    cy.login('john.doe@example.com', 'password123');
    
    // Should be on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back, John').should('be.visible');
    
    // Test Logout
    cy.logout();
    cy.url().should('include', '/');
  });

  it('should show validation errors for invalid registration', () => {
    cy.visit('/register');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('First name is required').should('be.visible');
    cy.contains('Last name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Test invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email format').should('be.visible');
    
    // Test weak password
    cy.get('input[name="email"]').clear().type('test@example.com');
    cy.get('input[name="password"]').type('123');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should show error for invalid login credentials', () => {
    cy.visit('/login');
    
    // Try invalid credentials
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should prevent access to protected routes when not authenticated', () => {
    // Try to access dashboard without login
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    
    // Try to access create trip without login
    cy.visit('/create-trip');
    cy.url().should('include', '/login');
    
    // Try to access profile without login
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  it('should maintain authentication state on page refresh', () => {
    // Login first
    cy.login();
    cy.url().should('include', '/dashboard');
    
    // Refresh page
    cy.reload();
    
    // Should still be authenticated
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});