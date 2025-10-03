import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import TripDetails from '../../pages/TripDetails';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/Common/Loading', () => {
  return function MockLoading({ message }) {
    return <div data-testid="loading">{message}</div>;
  };
});

// Mock MUI icons to prevent warnings
jest.mock('@mui/icons-material/ExpandMore', () => () => <div data-testid="expand-more-icon" />);
jest.mock('@mui/icons-material/AccessTime', () => () => <div data-testid="access-time-icon" />);
jest.mock('@mui/icons-material/LocationOn', () => () => <div data-testid="location-icon" />);
jest.mock('@mui/icons-material/AttachMoney', () => () => <div data-testid="money-icon" />);
jest.mock('@mui/icons-material/CalendarToday', () => () => <div data-testid="calendar-icon" />);

const mockedAxios = axios;

// Mock trip data
const mockTripData = {
  id: 1,
  title: 'European Adventure',
  destination: 'Paris, France',
  start_date: '2024-06-12',
  end_date: '2024-06-19',
  profile_name: 'Cultural Explorer',
  number_of_travelers: 2,
  budget: 3000,
  itinerary: [
    {
      id: 1,
      day_number: 1,
      date: '2024-06-12',
      activities: [
        {
          id: 1,
          title: 'Eiffel Tower Visit',
          description: 'Visit the iconic Eiffel Tower',
          time_slot: 'morning',
          start_time: '09:00:00',
          end_time: '11:00:00',
          location: 'Champ de Mars, Paris',
          cost: 25,
          reservation_required: true,
          notes: 'Book tickets in advance'
        },
        {
          id: 2,
          title: 'Seine River Cruise',
          description: 'Scenic boat ride along the Seine',
          time_slot: 'afternoon',
          start_time: '14:00:00',
          end_time: '15:30:00',
          location: 'Seine River, Paris',
          cost: 15,
          reservation_required: false,
          notes: null
        }
      ]
    },
    {
      id: 2,
      day_number: 2,
      date: '2024-06-13',
      activities: []
    }
  ]
};

describe('TripDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTripDetails = (tripId = '1') => {
    return render(
      <MemoryRouter initialEntries={[`/trip/${tripId}`]}>
        <Routes>
          <Route path="/trip/:id" element={<TripDetails />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // Loading state tests
  describe('Loading States', () => {
    it('displays loading component while fetching trip data', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderTripDetails();
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading trip details...')).toBeInTheDocument();
    });
  });

  // Error/not found tests
  describe('Error States', () => {
    it('displays trip not found message when trip is null', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Trip not found'));
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Trip not found')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Trip not found')).toBeInTheDocument();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching trip:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // Trip data display tests
  describe('Trip Data Display', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTripData });
    });

    it('displays basic trip information', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('European Adventure')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getByText('Cultural Explorer')).toBeInTheDocument();
      expect(screen.getByText('2 travelers')).toBeInTheDocument();
    });

    it('displays trip dates correctly', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        // More flexible date matching to handle timezone differences
        expect(screen.getByText(/Jun \d+ - Jun \d+, 2024/)).toBeInTheDocument();
      });
    });

    it('displays budget when provided', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Budget: $3000')).toBeInTheDocument();
      });
    });

    it('handles single traveler text correctly', async () => {
      const singleTravelerTrip = { ...mockTripData, number_of_travelers: 1 };
      mockedAxios.get.mockResolvedValue({ data: singleTravelerTrip });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('1 traveler')).toBeInTheDocument();
      });
    });

    it('displays navigation buttons', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /edit trip/i })).toBeInTheDocument();
    });
  });

  // Itinerary tests
  describe('Itinerary Display', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTripData });
    });

    it('displays itinerary section title', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Itinerary')).toBeInTheDocument();
      });
    });

    it('displays day information correctly', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        // More flexible matching for day information
        expect(screen.getByText(/Day 1 - \w+, June \d+/)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Day 2 - \w+, June \d+/)).toBeInTheDocument();
    });

    it('displays activities with complete information', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Eiffel Tower Visit')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Visit the iconic Eiffel Tower')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
      expect(screen.getByText('Champ de Mars, Paris')).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
      expect(screen.getByText('Book tickets in advance')).toBeInTheDocument();
      expect(screen.getByText('Reservation Required')).toBeInTheDocument();
    });

    it('displays multiple activities correctly', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Eiffel Tower Visit')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Seine River Cruise')).toBeInTheDocument();
      expect(screen.getByText('Scenic boat ride along the Seine')).toBeInTheDocument();
    });

    it('handles day with no activities', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        // More flexible matching for the second day
        expect(screen.getByText(/Day 2 - \w+, June \d+/)).toBeInTheDocument();
      });
      
      expect(screen.getByText('No activities planned for this day')).toBeInTheDocument();
    });

    it('displays activity without optional fields', async () => {
      const tripWithMinimalActivity = {
        ...mockTripData,
        itinerary: [{
          id: 1,
          day_number: 1,
          date: '2024-06-12',
          activities: [{
            id: 1,
            title: 'Simple Activity',
            time_slot: 'evening',
            cost: 0,
            reservation_required: false
          }]
        }]
      };
      mockedAxios.get.mockResolvedValue({ data: tripWithMinimalActivity });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Simple Activity')).toBeInTheDocument();
      });
      
      // Should not display cost for $0 activities
      expect(screen.queryByText('$0')).not.toBeInTheDocument();
      // Should not display reservation chip when not required
      expect(screen.queryByText('Reservation Required')).not.toBeInTheDocument();
    });
  });

  // Time slot color tests
  describe('Time Slot Colors', () => {
    it('displays different time slot chips with appropriate colors', async () => {
      const tripWithAllTimeSlots = {
        ...mockTripData,
        itinerary: [{
          id: 1,
          day_number: 1,
          date: '2024-06-12',
          activities: [
            { id: 1, title: 'Morning Activity', time_slot: 'morning' },
            { id: 2, title: 'Afternoon Activity', time_slot: 'afternoon' },
            { id: 3, title: 'Evening Activity', time_slot: 'evening' },
            { id: 4, title: 'Unknown Activity', time_slot: 'night' }
          ]
        }]
      };
      mockedAxios.get.mockResolvedValue({ data: tripWithAllTimeSlots });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('morning')).toBeInTheDocument();
      });
      
      expect(screen.getByText('afternoon')).toBeInTheDocument();
      expect(screen.getByText('evening')).toBeInTheDocument();
      expect(screen.getByText('night')).toBeInTheDocument();
    });
  });

  // No itinerary tests
  describe('No Itinerary State', () => {
    it('displays no itinerary message when itinerary is empty', async () => {
      const tripWithoutItinerary = { ...mockTripData, itinerary: [] };
      mockedAxios.get.mockResolvedValue({ data: tripWithoutItinerary });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('No itinerary generated yet')).toBeInTheDocument();
      });
      
      expect(screen.getByText('The itinerary will be automatically generated based on your traveler profile.')).toBeInTheDocument();
    });

    it('displays no itinerary message when itinerary is null', async () => {
      const tripWithoutItinerary = { ...mockTripData, itinerary: null };
      mockedAxios.get.mockResolvedValue({ data: tripWithoutItinerary });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('No itinerary generated yet')).toBeInTheDocument();
      });
    });
  });

  // API call tests
  describe('API Integration', () => {
    it('makes correct API call with trip ID', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTripData });
      
      renderTripDetails('123');
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/trips/123');
      });
    });

    it('makes API call on component mount', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTripData });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Trip without budget
  describe('Optional Trip Fields', () => {
    it('handles trip without budget', async () => {
      const tripWithoutBudget = { ...mockTripData };
      delete tripWithoutBudget.budget;
      mockedAxios.get.mockResolvedValue({ data: tripWithoutBudget });
      
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('European Adventure')).toBeInTheDocument();
      });
      
      expect(screen.queryByText(/Budget:/)).not.toBeInTheDocument();
    });
  });

  // Component structure tests
  describe('Component Structure', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTripData });
    });

    it('renders all major sections', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        expect(screen.getByText('European Adventure')).toBeInTheDocument();
      });
      
      // Check for major UI elements
      expect(screen.getByText('Itinerary')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit trip/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument();
    });

    it('uses accordion structure for days', async () => {
      renderTripDetails();
      
      await waitFor(() => {
        // More flexible matching for the first day
        expect(screen.getByText(/Day 1 - \w+, June \d+/)).toBeInTheDocument();
      });
      
      // Check for accordion expand icons
      expect(screen.getAllByTestId('expand-more-icon')).toHaveLength(2);
    });
  });
});