import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from '../contexts/AuthContext-Enhanced';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: {
      use: jest.fn(() => 1),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(() => 2),
      eject: jest.fn()
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to avoid noise in tests
const originalConsole = {
  log: console.log,
  error: console.error
};

// Test component to consume the auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
      <div data-testid="token">{auth.token || 'No token'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <button data-testid="login-btn" onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button data-testid="register-btn" onClick={() => auth.register({ email: 'test@example.com', password: 'password' })}>Register</button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext-Enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset axios defaults
    axios.defaults.headers.common = {};
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });

  it('throws error when useAuth is used outside provider', () => {
    // Temporarily suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponentOutsideProvider = () => {
      useAuth();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('initializes with no token and sets loading to false', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });

    expect(console.log).toHaveBeenCalledWith('Auth: No token found');
  });

  it('initializes with existing token from localStorage', async () => {
    const existingToken = 'existing-jwt-token';
    localStorageMock.getItem.mockReturnValue(existingToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent(existingToken);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${existingToken}`);
    expect(console.log).toHaveBeenCalledWith('Auth: Token set in axios defaults', existingToken.substring(0, 30) + '...');
  });

  it('sets up axios interceptors on mount', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(axios.interceptors.request.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
    expect(axios.interceptors.response.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('cleans up axios interceptors on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Get the interceptor IDs that were returned
    const requestInterceptorId = axios.interceptors.request.use.mock.results[0].value;
    const responseInterceptorId = axios.interceptors.response.use.mock.results[0].value;

    unmount();

    expect(axios.interceptors.request.eject).toHaveBeenCalledWith(requestInterceptorId);
    expect(axios.interceptors.response.eject).toHaveBeenCalledWith(responseInterceptorId);
  });

  describe('login functionality', () => {
    it('handles successful login', async () => {
      const mockResponse = {
        data: {
          token: 'new-jwt-token',
          user: { id: 1, email: 'test@example.com' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('token')).toHaveTextContent('new-jwt-token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-jwt-token');
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer new-jwt-token');
      expect(console.log).toHaveBeenCalledWith('Auth: Attempting login for', 'test@example.com');
      expect(console.log).toHaveBeenCalledWith('Auth: Login successful, user ID:', 1);
    });

    it('handles login failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };
      axios.post.mockRejectedValue(mockError);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('token')).toHaveTextContent('No token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(console.error).toHaveBeenCalledWith('Auth: Login failed', mockError);
    });

    it('handles login failure without response message', async () => {
      const mockError = new Error('Network error');
      axios.post.mockRejectedValue(mockError);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(console.error).toHaveBeenCalledWith('Auth: Login failed', mockError);
    });
  });

  describe('register functionality', () => {
    it('handles successful registration', async () => {
      const mockResponse = {
        data: {
          token: 'registration-jwt-token',
          user: { id: 2, email: 'test@example.com' }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('token')).toHaveTextContent('registration-jwt-token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'registration-jwt-token');
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer registration-jwt-token');
      expect(console.log).toHaveBeenCalledWith('Auth: Attempting registration for', 'test@example.com');
      expect(console.log).toHaveBeenCalledWith('Auth: Registration successful, user ID:', 2);
    });

    it('handles registration failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Email already exists' }
        }
      };
      axios.post.mockRejectedValue(mockError);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('token')).toHaveTextContent('No token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(console.error).toHaveBeenCalledWith('Auth: Registration failed', mockError);
    });

    it('handles registration failure without response message', async () => {
      const mockError = new Error('Network error');
      axios.post.mockRejectedValue(mockError);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(console.error).toHaveBeenCalledWith('Auth: Registration failed', mockError);
    });
  });

  describe('logout functionality', () => {
    it('clears user data and token on logout', async () => {
      // Start with a logged-in state
      const existingToken = 'existing-jwt-token';
      localStorageMock.getItem.mockReturnValue(existingToken);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Logout
      await act(async () => {
        getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('token')).toHaveTextContent('No token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith('Auth: Logging out');
    });
  });

  describe('axios interceptors', () => {
    it('logs request information', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Get the request interceptor function
      const requestInterceptor = axios.interceptors.request.use.mock.calls[0][0];
      
      const config = {
        method: 'GET',
        url: '/api/test',
        headers: { Authorization: 'Bearer token' }
      };

      const result = requestInterceptor(config);

      expect(console.log).toHaveBeenCalledWith('Axios Request:', {
        method: 'GET',
        url: '/api/test',
        hasAuth: true,
        headers: { Authorization: 'Bearer token' }
      });
      expect(result).toBe(config);
    });

    it('logs response information', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Get the response interceptor success function
      const responseInterceptor = axios.interceptors.response.use.mock.calls[0][0];
      
      const response = {
        status: 200,
        config: { url: '/api/test' },
        data: { message: 'Success' }
      };

      const result = responseInterceptor(response);

      expect(console.log).toHaveBeenCalledWith('Axios Response:', {
        status: 200,
        url: '/api/test',
        data: { message: 'Success' }
      });
      expect(result).toBe(response);
    });

    it('handles request errors', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Get the request interceptor error function
      const requestErrorInterceptor = axios.interceptors.request.use.mock.calls[0][1];
      
      const error = new Error('Request failed');

      await expect(requestErrorInterceptor(error)).rejects.toThrow('Request failed');
      expect(console.error).toHaveBeenCalledWith('Axios Request Error:', error);
    });

    it('handles response errors and logs out on 401', async () => {
      // Start with a logged-in state
      const existingToken = 'existing-jwt-token';
      localStorageMock.getItem.mockReturnValue(existingToken);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Get the response interceptor error function
      const responseErrorInterceptor = axios.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        },
        config: { url: '/api/test' },
        message: 'Request failed with status code 401'
      };

      await act(async () => {
        try {
          await responseErrorInterceptor(error);
        } catch (e) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      });

      expect(console.error).toHaveBeenCalledWith('Axios Response Error:', {
        status: 401,
        url: '/api/test',
        message: 'Request failed with status code 401',
        data: { message: 'Unauthorized' }
      });
      expect(console.log).toHaveBeenCalledWith('Auth: Received 401, logging out');
    });

    it('handles response errors without 401 status', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Get the response interceptor error function
      const responseErrorInterceptor = axios.interceptors.response.use.mock.calls[0][1];
      
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        },
        config: { url: '/api/test' },
        message: 'Request failed with status code 500'
      };

      try {
        await responseErrorInterceptor(error);
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
      
      expect(console.error).toHaveBeenCalledWith('Axios Response Error:', {
        status: 500,
        url: '/api/test',
        message: 'Request failed with status code 500',
        data: { message: 'Server error' }
      });
    });
  });

  describe('token validation', () => {
    it('calls validateToken when token exists', async () => {
      const existingToken = 'existing-jwt-token';
      localStorageMock.getItem.mockReturnValue(existingToken);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Auth: Token appears valid');
      });
    });
  });
});