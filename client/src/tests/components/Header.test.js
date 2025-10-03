import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Layout/Header';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders application title', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Lively Travel Planner')).toBeInTheDocument();
  });

  it('shows login and register links when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows user navigation when authenticated', () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create Trip')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument(); // Profile shows first name
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('displays user name when authenticated', () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('John')).toBeInTheDocument(); // Button shows firstName only
  });

  it('has correct navigation links', () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const createTripLink = screen.getByText('Create Trip').closest('a');
    const profileLink = screen.getByText('John').closest('a');
    
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(createTripLink).toHaveAttribute('href', '/create-trip');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });
});