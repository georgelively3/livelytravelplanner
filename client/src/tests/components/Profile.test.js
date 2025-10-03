import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../../pages/Profile';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock MUI icons to prevent warnings
jest.mock('@mui/icons-material/Person', () => () => <div data-testid="person-icon" />);

import { useAuth } from '../../contexts/AuthContext';

describe('Profile Component', () => {
  const renderProfileWithUser = (user) => {
    useAuth.mockReturnValue({
      user,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false
    });

    return render(<Profile />);
  };

  // User with complete information
  const mockUserComplete = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  // User with missing information
  const mockUserPartial = {
    id: 2,
    firstName: 'Jane',
    email: 'jane@example.com'
    // lastName is missing
  };

  describe('Component Structure', () => {
    it('renders profile page structure correctly', () => {
      renderProfileWithUser(mockUserComplete);

      // Check main elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByTestId('person-icon')).toBeInTheDocument();
    });

    it('displays avatar with person icon', () => {
      renderProfileWithUser(mockUserComplete);

      expect(screen.getByTestId('person-icon')).toBeInTheDocument();
    });

    it('displays profile section headers', () => {
      renderProfileWithUser(mockUserComplete);

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('displays coming soon message', () => {
      renderProfileWithUser(mockUserComplete);

      expect(screen.getByText('Profile management features coming soon!')).toBeInTheDocument();
    });
  });

  describe('User Information Display', () => {
    it('displays complete user information when all fields are provided', () => {
      renderProfileWithUser(mockUserComplete);

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('displays partial user information with fallbacks', () => {
      renderProfileWithUser(mockUserPartial);

      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Not provided')).toBeInTheDocument(); // For missing lastName
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('displays "Not provided" for all fields when user is null', () => {
      renderProfileWithUser(null);

      // Should show "Not provided" for all fields
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(3); // firstName, lastName, email
    });

    it('displays "Not provided" for all fields when user is undefined', () => {
      renderProfileWithUser(undefined);

      // Should show "Not provided" for all fields
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(3); // firstName, lastName, email
    });

    it('handles empty string values correctly', () => {
      const userWithEmptyStrings = {
        id: 3,
        firstName: '',
        lastName: '',
        email: ''
      };

      renderProfileWithUser(userWithEmptyStrings);

      // Empty strings should still show "Not provided"
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(3);
    });

    it('handles user with only email provided', () => {
      const userEmailOnly = {
        id: 4,
        email: 'onlyemail@example.com'
      };

      renderProfileWithUser(userEmailOnly);

      expect(screen.getByText('onlyemail@example.com')).toBeInTheDocument();
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(2); // firstName and lastName
    });

    it('handles user with only names provided', () => {
      const userNamesOnly = {
        id: 5,
        firstName: 'First',
        lastName: 'Last'
      };

      renderProfileWithUser(userNamesOnly);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(1); // email only
    });
  });

  describe('Grid Layout', () => {
    it('displays first and last name in separate grid items', () => {
      renderProfileWithUser(mockUserComplete);

      // Check that the grid structure exists
      const firstNameSection = screen.getByText('First Name').closest('div');
      const lastNameSection = screen.getByText('Last Name').closest('div');
      
      expect(firstNameSection).toBeInTheDocument();
      expect(lastNameSection).toBeInTheDocument();
      expect(firstNameSection).not.toBe(lastNameSection);
    });

    it('displays email in its own grid item', () => {
      renderProfileWithUser(mockUserComplete);

      const emailSection = screen.getByText('Email Address').closest('div');
      expect(emailSection).toBeInTheDocument();
    });
  });

  describe('Typography and Styling', () => {
    it('uses appropriate typography variants for headers', () => {
      renderProfileWithUser(mockUserComplete);

      // Main title should be h1
      const mainTitle = screen.getByRole('heading', { level: 1 });
      expect(mainTitle).toHaveTextContent('Profile');
    });

    it('displays field labels with consistent styling', () => {
      renderProfileWithUser(mockUserComplete);

      // All field labels should be present
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });
  });

  describe('Authentication Context Integration', () => {
    it('correctly accesses user from auth context', () => {
      const customUser = {
        id: 999,
        firstName: 'Context',
        lastName: 'User',
        email: 'context@example.com'
      };

      renderProfileWithUser(customUser);

      expect(screen.getByText('Context')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('context@example.com')).toBeInTheDocument();
    });

    it('handles auth context with loading state', () => {
      useAuth.mockReturnValue({
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        loading: true
      });

      render(<Profile />);

      // Should still render the profile page even when loading
      expect(screen.getByText('Profile')).toBeInTheDocument();
      const notProvidedTexts = screen.getAllByText('Not provided');
      expect(notProvidedTexts).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('handles user object with extra properties', () => {
      const userWithExtra = {
        id: 6,
        firstName: 'Extra',
        lastName: 'Props',
        email: 'extra@example.com',
        extraProperty: 'should be ignored',
        anotherExtra: 123
      };

      renderProfileWithUser(userWithExtra);

      expect(screen.getByText('Extra')).toBeInTheDocument();
      expect(screen.getByText('Props')).toBeInTheDocument();
      expect(screen.getByText('extra@example.com')).toBeInTheDocument();
      
      // Extra properties should not appear
      expect(screen.queryByText('should be ignored')).not.toBeInTheDocument();
      expect(screen.queryByText('123')).not.toBeInTheDocument();
    });

    it('handles special characters in user data', () => {
      const userSpecialChars = {
        id: 7,
        firstName: 'José',
        lastName: "O'Connor",
        email: 'josé.oconnor@example.com'
      };

      renderProfileWithUser(userSpecialChars);

      expect(screen.getByText('José')).toBeInTheDocument();
      expect(screen.getByText("O'Connor")).toBeInTheDocument();
      expect(screen.getByText('josé.oconnor@example.com')).toBeInTheDocument();
    });

    it('handles very long user data', () => {
      const userLongData = {
        id: 8,
        firstName: 'VeryLongFirstNameThatExceedsNormalLength',
        lastName: 'VeryLongLastNameThatExceedsNormalLength',
        email: 'verylongemailaddressthatexceedsnormallength@verylongdomainname.com'
      };

      renderProfileWithUser(userLongData);

      expect(screen.getByText('VeryLongFirstNameThatExceedsNormalLength')).toBeInTheDocument();
      expect(screen.getByText('VeryLongLastNameThatExceedsNormalLength')).toBeInTheDocument();
      expect(screen.getByText('verylongemailaddressthatexceedsnormallength@verylongdomainname.com')).toBeInTheDocument();
    });
  });
});