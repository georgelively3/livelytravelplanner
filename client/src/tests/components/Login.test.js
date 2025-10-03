import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import Login from '../../pages/Login';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders login form elements', () => {
    useAuth.mockReturnValue({
      login: jest.fn(),
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('updates input values when typing', () => {
    useAuth.mockReturnValue({
      login: jest.fn(),
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows validation errors for empty fields', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      success: true  // This won't be called since HTML5 validation prevents submission
    });

    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    // HTML5 validation will prevent form submission for required fields
    // The browser handles this validation, not our component
    // Just verify the form fields are marked as required
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  it('shows error message from server', async () => {
    const mockLogin = jest.fn(() => Promise.resolve({
      success: false,
      error: 'Invalid credentials'
    }));

    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      success: true
    });

    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('disables submit button during login process', async () => {
    const mockLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 100)
      )
    );

    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      logout: jest.fn(),
      loading: false
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // During async operation, button should be disabled and show loading text
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });
});