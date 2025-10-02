import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header';

const renderWithProviders = (component, authValue = null) => {
  const MockAuthProvider = ({ children }) => {
    const mockContextValue = authValue || {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    };
    
    return (
      <AuthProvider value={mockContextValue}>
        {children}
      </AuthProvider>
    );
  };

  return render(
    <BrowserRouter>
      <MockAuthProvider>
        {component}
      </MockAuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('renders application title', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Travel Planner')).toBeInTheDocument();
  });

  it('shows login and register links when user is not authenticated', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows user navigation when authenticated', () => {
    const authenticatedUser = {
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    };

    renderWithProviders(<Header />, authenticatedUser);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create Trip')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('displays user name when authenticated', () => {
    const authenticatedUser = {
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    };

    renderWithProviders(<Header />, authenticatedUser);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    const authenticatedUser = {
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    };

    renderWithProviders(<Header />, authenticatedUser);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const createTripLink = screen.getByText('Create Trip').closest('a');
    const profileLink = screen.getByText('Profile').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(createTripLink).toHaveAttribute('href', '/create-trip');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });
});