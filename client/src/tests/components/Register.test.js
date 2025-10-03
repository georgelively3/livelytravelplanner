import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../pages/Register';

// Mock the useAuth hook
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Register Component', () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockNavigate.mockClear();
  });

  const renderRegister = () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('renders all form fields and elements', () => {
    renderRegister();
    
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    renderRegister();
    
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  it('shows error when passwords do not match', async () => {
    renderRegister();
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpassword' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    renderRegister();
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register function with correct data on successful form submission', async () => {
    mockRegister.mockResolvedValue({ success: true });
    
    renderRegister();
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows loading state during registration', async () => {
    let resolveRegister;
    const registerPromise = new Promise(resolve => {
      resolveRegister = resolve;
    });
    mockRegister.mockReturnValue(registerPromise);
    
    renderRegister();
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    // Resolve the promise to complete the test
    resolveRegister({ success: true });
  });

  it('displays error message when registration fails', async () => {
    mockRegister.mockResolvedValue({ 
      success: false, 
      error: 'Email already exists' 
    });
    
    renderRegister();
    
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clears error message when form is resubmitted', async () => {
    mockRegister.mockResolvedValueOnce({ 
      success: false, 
      error: 'Email already exists' 
    }).mockResolvedValueOnce({ success: true });
    
    renderRegister();
    
    // Fill form and submit
    fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'John' } });
    fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    // Change email and resubmit
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Error should be cleared before new submission
    await waitFor(() => {
      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
    });
  });

  it('has link to login page', () => {
    renderRegister();
    
    const loginLink = screen.getByText('Already have an account? Sign in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});