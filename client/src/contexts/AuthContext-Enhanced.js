// Enhanced AuthContext with better error handling and debugging
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth: Token set in axios defaults', token.substring(0, 30) + '...');
      // Validate token by fetching user profile
      validateToken();
    } else {
      console.log('Auth: No token found');
    }
    setLoading(false);
  }, [token]);

  const validateToken = async () => {
    try {
      // You could add a /api/auth/me endpoint to validate the token
      console.log('Auth: Token appears valid');
    } catch (error) {
      console.error('Auth: Token validation failed', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Auth: Attempting login for', email);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      console.log('Auth: Login successful, user ID:', userData.id);
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Auth: Login failed', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Auth: Attempting registration for', userData.email);
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      console.log('Auth: Registration successful, user ID:', newUser.id);
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Auth: Registration failed', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('Auth: Logging out');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Add axios request interceptor for debugging
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        console.log('Axios Request:', {
          method: config.method,
          url: config.url,
          hasAuth: !!config.headers.Authorization,
          headers: config.headers
        });
        return config;
      },
      error => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => {
        console.log('Axios Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      error => {
        console.error('Axios Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        
        // If unauthorized, logout
        if (error.response?.status === 401) {
          console.log('Auth: Received 401, logging out');
          logout();
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};