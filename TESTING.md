# Testing Documentation

## Test Suite Overview

This project includes comprehensive testing at multiple levels:

### 1. Backend Testing (Jest + Supertest)

#### Unit Tests
- **Models**: User, Trip, Activity, etc.
- **Middleware**: Authentication middleware
- **Services**: Itinerary generation

#### Integration Tests  
- **API Routes**: Auth, Trips, Profiles
- **Database**: Full CRUD operations
- **Authentication**: JWT token validation

### 2. Frontend Testing (React Testing Library + Jest)

#### Component Tests
- **Pages**: Login, Register, CreateTrip, Dashboard
- **Components**: Header, Footer, Loading
- **Contexts**: AuthContext

### 3. End-to-End Testing (Cypress)

#### User Flows
- **Authentication**: Registration, login, logout
- **Trip Management**: Create, view, edit trips
- **Navigation**: Protected routes, redirects

## Running Tests

### All Tests
```bash
npm run test              # Backend + Frontend unit tests
npm run test:coverage     # With coverage reports
npm run test:e2e          # End-to-end tests
npm run test:all          # Everything
```

### Backend Only
```bash
cd server
npm test                  # All backend tests
npm run test:unit         # Models + middleware only
npm run test:integration  # API routes only
npm run test:coverage     # With coverage
```

### Frontend Only
```bash
cd client
npm test                  # Interactive mode
npm run test:coverage     # With coverage
npm run test:ci           # CI mode (non-interactive)
```

### E2E Tests
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:open     # Interactive mode
```

## Test Coverage Goals

- **Backend**: >80% statement coverage
- **Frontend**: >75% statement coverage
- **Integration**: All major API endpoints
- **E2E**: Core user journeys

## Current Status

✅ **Completed**:
- Test infrastructure setup
- Authentication middleware tests (100% coverage)
- Basic model test structure
- Frontend component test examples
- E2E test framework setup

🔄 **In Progress**:
- Model method implementations
- Database test isolation
- API integration tests
- Component test coverage

📋 **Pending**:
- Service layer tests
- Error handling scenarios
- Performance testing
- Cross-browser E2E testing