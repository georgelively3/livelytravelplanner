import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../../App';

// Mock all the page components
jest.mock('../../pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../../pages/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('../../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('../../pages/CreateTrip', () => {
  return function MockCreateTrip() {
    return <div data-testid="create-trip-page">Create Trip Page</div>;
  };
});

jest.mock('../../pages/TripDetails', () => {
  return function MockTripDetails() {
    return <div data-testid="trip-details-page">Trip Details Page</div>;
  };
});

jest.mock('../../pages/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../../components/Layout/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../components/Layout/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('../../components/Common/Loading', () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const theme = createTheme();

describe('App Component', () => {
  const renderApp = (initialRoute = '/') => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  describe('Loading State', () => {
    it('displays loading component when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      renderApp();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    });
  });

  describe('App Structure', () => {
    it('renders header, main content, and footer when not loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      renderApp();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('applies correct container styling', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      const { container } = renderApp();

      // Check for App div class
      expect(container.querySelector('.App')).toBeInTheDocument();
      
      // Check for Material-UI Container
      expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });
    });

    it('renders Home page at root path', () => {
      renderApp('/');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders Login page at /login when not authenticated', () => {
      renderApp('/login');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders Register page at /register when not authenticated', () => {
      renderApp('/register');
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('redirects to home page for unknown routes when not authenticated', () => {
      renderApp('/unknown-route');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });
    });

    it('redirects to login when accessing dashboard without authentication', () => {
      renderApp('/dashboard');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    });

    it('redirects to login when accessing create-trip without authentication', () => {
      renderApp('/create-trip');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('create-trip-page')).not.toBeInTheDocument();
    });

    it('redirects to login when accessing trip details without authentication', () => {
      renderApp('/trip/123');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('trip-details-page')).not.toBeInTheDocument();
    });

    it('redirects to login when accessing profile without authentication', () => {
      renderApp('/profile');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
    });
  });

  describe('Protected Routes - Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });
    });

    it('renders Dashboard page when authenticated', () => {
      renderApp('/dashboard');
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('renders CreateTrip page when authenticated', () => {
      renderApp('/create-trip');
      expect(screen.getByTestId('create-trip-page')).toBeInTheDocument();
    });

    it('renders TripDetails page when authenticated', () => {
      renderApp('/trip/123');
      expect(screen.getByTestId('trip-details-page')).toBeInTheDocument();
    });

    it('renders Profile page when authenticated', () => {
      renderApp('/profile');
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('redirects to dashboard when accessing login while authenticated', () => {
      renderApp('/login');
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('redirects to dashboard when accessing register while authenticated', () => {
      renderApp('/register');
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      expect(screen.queryByTestId('register-page')).not.toBeInTheDocument();
    });

    it('still allows access to home page when authenticated', () => {
      renderApp('/');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('redirects to home page for unknown routes when authenticated', () => {
      renderApp('/unknown-route');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });
    });

    it('handles trip ID parameter in TripDetails route', () => {
      renderApp('/trip/456');
      expect(screen.getByTestId('trip-details-page')).toBeInTheDocument();
    });

    it('handles trip ID parameter with special characters', () => {
      renderApp('/trip/test-trip-123');
      expect(screen.getByTestId('trip-details-page')).toBeInTheDocument();
    });
  });

  describe('Authentication State Changes', () => {
    it('handles transition from loading to authenticated', () => {
      // First render in loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      const { rerender } = renderApp('/dashboard');
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Then simulate auth completion with authenticated user
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      rerender(
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('handles transition from loading to unauthenticated', () => {
      // First render in loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
      });

      const { rerender } = renderApp('/dashboard');
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Then simulate auth completion with unauthenticated user
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      rerender(
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Layout Integration', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });
    });

    it('includes header and footer in all non-loading states', () => {
      renderApp('/');
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('maintains header and footer across different routes', () => {
      // Test header and footer on home page
      renderApp('/');
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      
      // Clean up first render
      cleanup();
      
      // Test header and footer on login page
      renderApp('/login');
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});