import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

// Mock the useAuth hook
const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('Home Component', () => {
  const renderHome = () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('renders main hero section content', () => {
      renderHome();

      expect(screen.getByRole('heading', { name: 'Plan Your Perfect Journey' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Create personalized travel itineraries tailored to your unique travel style' })).toBeInTheDocument();
    });

    it('shows get started and sign in buttons for unauthenticated users', () => {
      renderHome();

      expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /create new trip/i })).not.toBeInTheDocument();
    });

    it('has correct navigation links for unauthenticated users', () => {
      renderHome();

      const getStartedLink = screen.getByRole('link', { name: 'Get Started' });
      const signInLink = screen.getByRole('link', { name: 'Sign In' });

      expect(getStartedLink).toHaveAttribute('href', '/register');
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('does not show plan trip buttons on travel profile cards', () => {
      renderHome();

      expect(screen.queryByRole('button', { name: 'Plan Trip' })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
    });

    it('shows create new trip button for authenticated users', () => {
      renderHome();

      expect(screen.getByRole('link', { name: /create new trip/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Get Started' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
    });

    it('has correct navigation link for create new trip', () => {
      renderHome();

      const createTripLink = screen.getByRole('link', { name: /create new trip/i });
      expect(createTripLink).toHaveAttribute('href', '/create-trip');
    });

    it('shows plan trip buttons on travel profile cards', () => {
      renderHome();

      const planTripButtons = screen.getAllByRole('link', { name: 'Plan Trip' });
      expect(planTripButtons).toHaveLength(5); // Should have 5 travel profiles
      
      planTripButtons.forEach(button => {
        expect(button).toHaveAttribute('href', '/create-trip');
      });
    });
  });

  describe('travel profiles section', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('renders travel profiles section heading', () => {
      renderHome();

      expect(screen.getByRole('heading', { name: 'Travel Profiles for Every Explorer' })).toBeInTheDocument();
    });

    it('displays all travel profile cards', () => {
      renderHome();

      expect(screen.getByText('Mobility-Conscious Traveler')).toBeInTheDocument();
      expect(screen.getByText('Family with Young Children')).toBeInTheDocument();
      expect(screen.getByText('Foodie / Culinary Explorer')).toBeInTheDocument();
      expect(screen.getByText('Adventure / Active Traveler')).toBeInTheDocument();
      expect(screen.getByText('Cultural Enthusiast / History Buff')).toBeInTheDocument();
    });

    it('displays travel profile descriptions', () => {
      renderHome();

      expect(screen.getByText(/wheelchair accessible routes/i)).toBeInTheDocument();
      expect(screen.getByText(/kid-friendly activities/i)).toBeInTheDocument();
      expect(screen.getByText(/local cuisine focus/i)).toBeInTheDocument();
      expect(screen.getByText(/high-energy activities/i)).toBeInTheDocument();
      expect(screen.getByText(/museums, galleries/i)).toBeInTheDocument();
    });
  });

  describe('how it works section', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('renders how it works section heading', () => {
      renderHome();

      expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
    });

    it('displays all three steps', () => {
      renderHome();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Choose Your Profile')).toBeInTheDocument();
      expect(screen.getByText(/select a traveler profile/i)).toBeInTheDocument();

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Enter Trip Details')).toBeInTheDocument();
      expect(screen.getByText(/provide your destination/i)).toBeInTheDocument();

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Get Your Itinerary')).toBeInTheDocument();
      expect(screen.getByText(/receive a personalized/i)).toBeInTheDocument();
    });
  });

  describe('responsive and accessibility features', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('uses proper heading hierarchy', () => {
      renderHome();

      // The main hero heading
      expect(screen.getByRole('heading', { name: 'Plan Your Perfect Journey' })).toBeInTheDocument();
      
      // Section headings
      expect(screen.getByRole('heading', { name: 'Travel Profiles for Every Explorer' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
      
      // Profile titles (should be h3)
      expect(screen.getByRole('heading', { name: 'Mobility-Conscious Traveler' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Family with Young Children' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Foodie / Culinary Explorer' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Adventure / Active Traveler' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Cultural Enthusiast / History Buff' })).toBeInTheDocument();
      
      // How it works step titles
      expect(screen.getByRole('heading', { name: 'Choose Your Profile' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Enter Trip Details' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Get Your Itinerary' })).toBeInTheDocument();
    });

    it('includes icons for travel profiles', () => {
      renderHome();

      // Check if the component renders without errors - icons are rendered as SVGs
      expect(screen.getByText('Mobility-Conscious Traveler')).toBeInTheDocument();
      expect(screen.getByText('Family with Young Children')).toBeInTheDocument();
      expect(screen.getByText('Foodie / Culinary Explorer')).toBeInTheDocument();
      expect(screen.getByText('Adventure / Active Traveler')).toBeInTheDocument();
      expect(screen.getByText('Cultural Enthusiast / History Buff')).toBeInTheDocument();
    });
  });

  describe('component structure and layout', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
    });

    it('renders all main sections', () => {
      renderHome();

      // Hero section
      expect(screen.getByRole('heading', { name: 'Plan Your Perfect Journey' })).toBeInTheDocument();
      
      // Travel profiles section
      expect(screen.getByRole('heading', { name: 'Travel Profiles for Every Explorer' })).toBeInTheDocument();
      
      // How it works section  
      expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
    });

    it('renders without crashing', () => {
      expect(() => renderHome()).not.toThrow();
    });
  });
});