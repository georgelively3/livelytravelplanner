import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateTrip from '../../pages/CreateTrip';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the Loading component
jest.mock('../../components/Common/Loading', () => {
  return function MockLoading({ message }) {
    return <div data-testid="loading">{message}</div>;
  };
});

describe('CreateTrip Component', () => {
  const mockProfiles = [
    {
      id: 1,
      name: 'Cultural Enthusiast',
      description: 'Loves museums, art galleries, and historical sites'
    },
    {
      id: 2,
      name: 'Adventure Seeker',
      description: 'Enjoys outdoor activities and extreme sports'
    },
    {
      id: 3,
      name: 'Relaxation Focused',
      description: 'Prefers spa treatments and peaceful environments'
    }
  ];

  const renderCreateTrip = () => {
    render(
      <BrowserRouter>
        <CreateTrip />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('loading state', () => {
    it('displays loading message while fetching profiles', async () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderCreateTrip();

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading traveler profiles...')).toBeInTheDocument();
    });

    it('loads and displays profiles after successful fetch', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Create New Trip')).toBeInTheDocument();
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/profiles');
    });

    it('handles profile fetch error gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      renderCreateTrip();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load traveler profiles')).toBeInTheDocument();
      });
    });
  });

  describe('form rendering', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('renders all form fields', () => {
      expect(screen.getByLabelText(/trip title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Traveler profile select
      expect(screen.getByLabelText(/number of travelers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget.*optional/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      expect(screen.getByRole('button', { name: /create trip & generate itinerary/i })).toBeInTheDocument();
    });

    it('has correct initial form values', () => {
      expect(screen.getByLabelText(/trip title/i)).toHaveValue('');
      expect(screen.getByLabelText(/destination/i)).toHaveValue('');
      expect(screen.getByLabelText(/number of travelers/i)).toHaveValue(1);
      expect(screen.getByLabelText(/budget.*optional/i)).toHaveValue(null);
    });
  });

  describe('form interactions', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('updates title field on input', () => {
      const titleInput = screen.getByLabelText(/trip title/i);
      fireEvent.change(titleInput, { target: { value: 'My Amazing Trip' } });
      expect(titleInput).toHaveValue('My Amazing Trip');
    });

    it('updates destination field on input', () => {
      const destinationInput = screen.getByLabelText(/destination/i);
      fireEvent.change(destinationInput, { target: { value: 'Paris, France' } });
      expect(destinationInput).toHaveValue('Paris, France');
    });

    it('updates start date field on input', () => {
      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: '2024-06-15' } });
      expect(startDateInput).toHaveValue('2024-06-15');
    });

    it('updates end date field on input', () => {
      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endDateInput, { target: { value: '2024-06-22' } });
      expect(endDateInput).toHaveValue('2024-06-22');
    });

    it('updates number of travelers field on input', () => {
      const travelersInput = screen.getByLabelText(/number of travelers/i);
      fireEvent.change(travelersInput, { target: { value: '3' } });
      expect(travelersInput).toHaveValue(3);
    });

    it('updates budget field on input', () => {
      const budgetInput = screen.getByLabelText(/budget.*optional/i);
      fireEvent.change(budgetInput, { target: { value: '2500.50' } });
      expect(budgetInput).toHaveValue(2500.50);
    });

    it('displays and selects traveler profiles', async () => {
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);

      await waitFor(() => {
        expect(screen.getByText('Cultural Enthusiast')).toBeInTheDocument();
        expect(screen.getByText('Adventure Seeker')).toBeInTheDocument();
        expect(screen.getByText('Relaxation Focused')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cultural Enthusiast'));
      expect(profileSelect).toHaveTextContent('Cultural Enthusiast');
    });
  });

  describe('form validation', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('shows error when submitting empty form', async () => {
      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });

    it('shows error when end date is before start date', async () => {
      // Fill in all required fields but with invalid dates
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-22' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-15' } });
      
      // Select a profile
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });
    });

    it('shows error when no traveler profile is selected', async () => {
      // Fill in all fields except profile
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
      });
    });
  });

  describe('successful form submission', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('submits form with valid data and navigates to trip details', async () => {
      const mockTripResponse = { data: { id: 123 } };
      mockedAxios.post.mockResolvedValue(mockTripResponse);

      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Paris Adventure' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Paris, France' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });
      fireEvent.change(screen.getByLabelText(/number of travelers/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/budget.*optional/i), { target: { value: '3000' } });
      
      // Select a profile
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent('Creating Trip...');
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/trips', {
          title: 'Paris Adventure',
          destination: 'Paris, France',
          startDate: '2024-06-15',
          endDate: '2024-06-22',
          travelerProfileId: 1,
          numberOfTravelers: 2,
          budget: 3000
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/trip/123');
      });
    });

    it('submits form without optional budget field', async () => {
      const mockTripResponse = { data: { id: 456 } };
      mockedAxios.post.mockResolvedValue(mockTripResponse);

      // Fill in only required fields
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Budget Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Local City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-07-01' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-07-07' } });
      
      // Select a profile
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Adventure Seeker'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/trips', {
          title: 'Budget Trip',
          destination: 'Local City',
          startDate: '2024-07-01',
          endDate: '2024-07-07',
          travelerProfileId: 2,
          numberOfTravelers: 1
          // Note: budget should not be included
        });
      });
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('handles API submission error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid trip data' }
        }
      });

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });
      
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid trip data')).toBeInTheDocument();
      });
    });

    it('handles validation errors from API', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 422,
          data: {
            errors: [
              { path: 'title', msg: 'Title is required' },
              { path: 'destination', msg: 'Destination is required' }
            ]
          }
        }
      });

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });
      
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/validation errors.*title.*title is required.*destination.*destination is required/i)).toBeInTheDocument();
      });
    });

    it('handles network error gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });
      
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create trip.*status.*undefined/i)).toBeInTheDocument();
      });
    });
  });

  describe('component structure', () => {
    beforeEach(async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProfiles });
      renderCreateTrip();
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('renders without crashing', () => {
      expect(screen.getByText('Create New Trip')).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('disables submit button while submitting', async () => {
      mockedAxios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/trip title/i), { target: { value: 'Test Trip' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test City' } });
      fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2024-06-15' } });
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2024-06-22' } });
      
      const profileSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(profileSelect);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Cultural Enthusiast'));
      });

      const submitButton = screen.getByRole('button', { name: /create trip & generate itinerary/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating trip/i })).toBeDisabled();
      });
    });
  });
});