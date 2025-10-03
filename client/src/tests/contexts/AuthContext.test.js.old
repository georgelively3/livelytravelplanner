import React from 'react';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Test component to access AuthContext
const TestComponent = () => {
  const { user, token, login, register, logout, loading, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? `User: ${user.firstName}` : 'No User'}</div>
      <div data-testid="token">{token || 'No Token'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <button 
        data-testid="login-btn" 
        onClick={async () => {
          const result = await login('test@example.com', 'password123');
          console.log('Login result:', result);
        }}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={async () => {
          const result = await register({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' });
          console.log('Register result:', result);
        }}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

// Test component without AuthProvider to test error handling
const TestComponentWithoutProvider = () => {
  try {
    useAuth();
    return <div data-testid="no-error">No error</div>;
  } catch (error) {
    return <div data-testid="error">{error.message}</div>;
  }
};

describe('AuthContext', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = require('axios');
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    // Reset axios defaults
    mockAxios.defaults.headers.common = {};
    mockAxios.post.mockReset();
  });

  afterEach(() => {
    cleanup();
    mockAxios.defaults.headers.common = {};
  });

  describe('useAuth hook error handling', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test since we expect an error
      const originalError = console.error;
      console.error = jest.fn();

      render(<TestComponentWithoutProvider />);
      
      expect(screen.getByTestId('error')).toHaveTextContent(
        'useAuth must be used within an AuthProvider'
      );

      console.error = originalError;
    });
  });

  describe('AuthProvider initialization', () => {
    it('provides initial auth state with no token', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent('No Token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    it('restores user and token from localStorage on mount', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const mockToken = 'stored-token-123';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('User: John');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Verify axios authorization header is set
      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('handles corrupted user data in localStorage gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockToken = 'stored-token-123';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return 'invalid-json-data';
        return null;
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      // Should handle error gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse user from localStorage:',
        expect.any(SyntaxError)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
      
      consoleSpy.mockRestore();
    });

    it('sets axios authorization header when token exists', async () => {
      const mockToken = 'stored-token-123';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        return null;
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });
  });

  describe('login functionality', () => {
    it('handles successful login', async () => {
      const mockUserData = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };
      const mockToken = 'login-token-123';

      mockAxios.post.mockResolvedValueOnce({
        data: {
          token: mockToken,
          user: mockUserData
        }
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginBtn.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('User: Jane');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', { 
        email: 'test@example.com', 
        password: 'password123' 
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('handles failed login with response error message', async () => {
      mockAxios.post.mockRejectedValueOnce({
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
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginBtn.click();
      });
      
      // State should remain unchanged after failed login
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent('No Token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles failed login without response error message', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('Network error'));
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      const loginBtn = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginBtn.click();
      });
      
      // State should remain unchanged after failed login
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent('No Token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register functionality', () => {
    it('handles successful registration', async () => {
      const mockUserData = {
        id: 2,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      };
      const mockToken = 'register-token-123';

      mockAxios.post.mockResolvedValueOnce({
        data: {
          token: mockToken,
          user: mockUserData
        }
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      const registerBtn = screen.getByTestId('register-btn');
      
      await act(async () => {
        registerBtn.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('User: Test');
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/register', { 
        email: 'test@example.com', 
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
      expect(mockAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('handles failed registration', async () => {
      mockAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            message: 'Email already exists'
          }
        }
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      const registerBtn = screen.getByTestId('register-btn');
      
      await act(async () => {
        registerBtn.click();
      });
      
      // State should remain unchanged after failed registration
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent('No Token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout functionality', () => {
    it('clears all auth state on logout', async () => {
      // Set up initial authenticated state
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const mockToken = 'existing-token-123';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for initial state to load
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('User: John');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      const logoutBtn = screen.getByTestId('logout-btn');
      
      await act(async () => {
        logoutBtn.click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('token')).toHaveTextContent('No Token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(mockAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('isAuthenticated computed property', () => {
    it('returns true when token is present', async () => {
      const mockToken = 'test-token';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        return null;
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
    });
  });
});