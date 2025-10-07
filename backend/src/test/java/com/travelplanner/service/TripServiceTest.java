package com.travelplanner.service;

import com.travelplanner.entity.Trip;
import com.travelplanner.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private TripService tripService;

    private Trip testTrip;
    private Trip anotherTrip;

    @BeforeEach
    void setUp() {
        testTrip = new Trip();
        testTrip.setId(1L);
        testTrip.setName("Tokyo Adventure");
        testTrip.setDescription("Exploring Japan's capital");
        testTrip.setStartDate(LocalDate.of(2024, 6, 1));
        testTrip.setEndDate(LocalDate.of(2024, 6, 10));
        testTrip.setDestination("Tokyo");

        anotherTrip = new Trip();
        anotherTrip.setId(2L);
        anotherTrip.setName("Paris Getaway");
        anotherTrip.setDescription("Romantic trip to France");
        anotherTrip.setStartDate(LocalDate.of(2024, 8, 15));
        anotherTrip.setEndDate(LocalDate.of(2024, 8, 22));
        anotherTrip.setDestination("Paris");
    }

    @Test
    void getAllTrips_ShouldReturnAllTrips() {
        // Given
        List<Trip> expectedTrips = Arrays.asList(testTrip, anotherTrip);
        when(tripRepository.findAll()).thenReturn(expectedTrips);

        // When
        List<Trip> actualTrips = tripService.getAllTrips();

        // Then
        assertEquals(2, actualTrips.size());
        assertEquals(expectedTrips, actualTrips);
        verify(tripRepository, times(1)).findAll();
    }

    @Test
    void getAllTrips_WhenEmpty_ShouldReturnEmptyList() {
        // Given
        when(tripRepository.findAll()).thenReturn(Arrays.asList());

        // When
        List<Trip> actualTrips = tripService.getAllTrips();

        // Then
        assertTrue(actualTrips.isEmpty());
        verify(tripRepository, times(1)).findAll();
    }

    @Test
    void getTripById_WhenTripExists_ShouldReturnTrip() {
        // Given
        when(tripRepository.findById(1L)).thenReturn(Optional.of(testTrip));

        // When
        Optional<Trip> actualTrip = tripService.getTripById(1L);

        // Then
        assertTrue(actualTrip.isPresent());
        assertEquals(testTrip, actualTrip.get());
        verify(tripRepository, times(1)).findById(1L);
    }

    @Test
    void getTripById_WhenTripNotExists_ShouldReturnEmptyOptional() {
        // Given
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Trip> actualTrip = tripService.getTripById(999L);

        // Then
        assertFalse(actualTrip.isPresent());
        verify(tripRepository, times(1)).findById(999L);
    }

    @Test
    void createTrip_ShouldSaveAndReturnTrip() {
        // Given
        Trip newTrip = new Trip("London Trip", "Business travel", 
                LocalDate.of(2024, 5, 1), LocalDate.of(2024, 5, 5), "London");
        Trip savedTrip = new Trip("London Trip", "Business travel", 
                LocalDate.of(2024, 5, 1), LocalDate.of(2024, 5, 5), "London");
        savedTrip.setId(3L);
        
        when(tripRepository.save(newTrip)).thenReturn(savedTrip);

        // When
        Trip actualTrip = tripService.createTrip(newTrip);

        // Then
        assertEquals(savedTrip, actualTrip);
        assertEquals(3L, actualTrip.getId());
        verify(tripRepository, times(1)).save(newTrip);
    }

    @Test
    void updateTrip_WhenTripExists_ShouldUpdateAndReturnTrip() {
        // Given
        Trip updatedDetails = new Trip();
        updatedDetails.setName("Updated Tokyo Adventure");
        updatedDetails.setDescription("Updated description");
        updatedDetails.setStartDate(LocalDate.of(2024, 7, 1));
        updatedDetails.setEndDate(LocalDate.of(2024, 7, 10));
        updatedDetails.setDestination("Kyoto");

        when(tripRepository.findById(1L)).thenReturn(Optional.of(testTrip));
        when(tripRepository.save(testTrip)).thenReturn(testTrip);

        // When
        Trip actualTrip = tripService.updateTrip(1L, updatedDetails);

        // Then
        assertEquals("Updated Tokyo Adventure", actualTrip.getName());
        assertEquals("Updated description", actualTrip.getDescription());
        assertEquals(LocalDate.of(2024, 7, 1), actualTrip.getStartDate());
        assertEquals(LocalDate.of(2024, 7, 10), actualTrip.getEndDate());
        assertEquals("Kyoto", actualTrip.getDestination());
        
        verify(tripRepository, times(1)).findById(1L);
        verify(tripRepository, times(1)).save(testTrip);
    }

    @Test
    void updateTrip_WhenTripNotExists_ShouldThrowException() {
        // Given
        Trip updatedDetails = new Trip();
        updatedDetails.setName("Updated Trip");
        
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> tripService.updateTrip(999L, updatedDetails));
        
        assertEquals("Trip not found with id: 999", exception.getMessage());
        verify(tripRepository, times(1)).findById(999L);
        verify(tripRepository, never()).save(any(Trip.class));
    }

    @Test
    void deleteTrip_WhenTripExists_ShouldDeleteTrip() {
        // Given
        when(tripRepository.findById(1L)).thenReturn(Optional.of(testTrip));

        // When
        tripService.deleteTrip(1L);

        // Then
        verify(tripRepository, times(1)).findById(1L);
        verify(tripRepository, times(1)).delete(testTrip);
    }

    @Test
    void deleteTrip_WhenTripNotExists_ShouldThrowException() {
        // Given
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> tripService.deleteTrip(999L));
        
        assertEquals("Trip not found with id: 999", exception.getMessage());
        verify(tripRepository, times(1)).findById(999L);
        verify(tripRepository, never()).delete(any(Trip.class));
    }

    @Test
    void searchTripsByDestination_ShouldReturnMatchingTrips() {
        // Given
        List<Trip> expectedTrips = Arrays.asList(testTrip);
        when(tripRepository.findByDestinationContainingIgnoreCase("tokyo"))
                .thenReturn(expectedTrips);

        // When
        List<Trip> actualTrips = tripService.searchTripsByDestination("tokyo");

        // Then
        assertEquals(1, actualTrips.size());
        assertEquals(testTrip, actualTrips.get(0));
        verify(tripRepository, times(1)).findByDestinationContainingIgnoreCase("tokyo");
    }

    @Test
    void searchTripsByDestination_WhenNoMatches_ShouldReturnEmptyList() {
        // Given
        when(tripRepository.findByDestinationContainingIgnoreCase("antarctica"))
                .thenReturn(Arrays.asList());

        // When
        List<Trip> actualTrips = tripService.searchTripsByDestination("antarctica");

        // Then
        assertTrue(actualTrips.isEmpty());
        verify(tripRepository, times(1)).findByDestinationContainingIgnoreCase("antarctica");
    }

    @Test
    void getUpcomingTrips_ShouldReturnFutureTrips() {
        // Given
        Trip futureTrip = new Trip();
        futureTrip.setId(3L);
        futureTrip.setName("Future Trip");
        futureTrip.setStartDate(LocalDate.now().plusDays(30));
        
        List<Trip> expectedTrips = Arrays.asList(futureTrip);
        when(tripRepository.findByStartDateAfter(any(LocalDate.class)))
                .thenReturn(expectedTrips);

        // When
        List<Trip> actualTrips = tripService.getUpcomingTrips();

        // Then
        assertEquals(1, actualTrips.size());
        assertEquals(futureTrip, actualTrips.get(0));
        verify(tripRepository, times(1)).findByStartDateAfter(any(LocalDate.class));
    }

    @Test
    void getUpcomingTrips_WhenNoUpcomingTrips_ShouldReturnEmptyList() {
        // Given
        when(tripRepository.findByStartDateAfter(any(LocalDate.class)))
                .thenReturn(Arrays.asList());

        // When
        List<Trip> actualTrips = tripService.getUpcomingTrips();

        // Then
        assertTrue(actualTrips.isEmpty());
        verify(tripRepository, times(1)).findByStartDateAfter(any(LocalDate.class));
    }
}