import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Test component to access AuthContext
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? `User: ${user.firstName}` : 'No User'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset axios defaults
    delete mockedAxios.defaults.headers.common['Authorization'];
  });

  it('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('restores user from localStorage on mount', async () => {
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: John');
    });
  });

  it('handles successful login', async () => {
    const mockUserData = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'Login successful',
        token: 'mock-token',
        user: mockUserData
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginBtn = screen.getByTestId('login-btn');
    
    await act(async () => {
      loginBtn.click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: Jane');
    });
    
    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUserData);
  });

  it('handles failed login', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: 'Invalid credentials'
        }
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginBtn = screen.getByTestId('login-btn');
    
    await act(async () => {
      loginBtn.click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('handles logout', async () => {
    // Set up initial authenticated state
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial state to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('User: John');
    });
    
    const logoutBtn = screen.getByTestId('logout-btn');
    
    await act(async () => {
      logoutBtn.click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('shows loading state during login', async () => {
    const mockResponse = new Promise(resolve => 
      setTimeout(() => resolve({
        data: {
          message: 'Login successful',
          token: 'mock-token',
          user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' }
        }
      }), 100)
    );
    
    mockedAxios.post.mockReturnValueOnce(mockResponse);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginBtn = screen.getByTestId('login-btn');
    
    await act(async () => {
      loginBtn.click();
    });
    
    // Should show loading during request
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });
});