package com.travelplanner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.model.Trip;
import com.travelplanner.service.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TripControllerTest {

    private MockMvc mockMvc;
    
    @Mock
    private TripService tripService;
    
    @InjectMocks
    private TripController tripController;
    
    private ObjectMapper objectMapper;
    private Trip sampleTrip;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tripController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // For LocalDate support
        
        sampleTrip = new Trip();
        sampleTrip.setId(1L);
        sampleTrip.setName("Tokyo Adventure");
        sampleTrip.setDestination("Tokyo, Japan");
        sampleTrip.setStartDate(LocalDate.of(2024, 6, 15));
        sampleTrip.setEndDate(LocalDate.of(2024, 6, 25));
        sampleTrip.setDescription("Amazing cultural experience");
    }
    
    @Test
    void getAllTrips_ReturnsListOfTrips() throws Exception {
        // Given
        Trip trip2 = new Trip();
        trip2.setId(2L);
        trip2.setName("Paris Getaway");
        trip2.setDestination("Paris, France");
        trip2.setStartDate(LocalDate.of(2024, 8, 10));
        trip2.setEndDate(LocalDate.of(2024, 8, 20));
        trip2.setDescription("Romantic vacation");
        
        List<Trip> trips = Arrays.asList(sampleTrip, trip2);
        when(tripService.getAllTrips()).thenReturn(trips);
        
        // When & Then
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].destination").value("Tokyo, Japan"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].destination").value("Paris, France"));
        
        verify(tripService).getAllTrips();
    }
    
    @Test
    void getAllTrips_ReturnsEmptyList() throws Exception {
        // Given
        when(tripService.getAllTrips()).thenReturn(Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        
        verify(tripService).getAllTrips();
    }
    
    @Test
    void getTripById_ExistingTrip_ReturnsTrip() throws Exception {
        // Given
        when(tripService.getTripById(1L)).thenReturn(Optional.of(sampleTrip));
        
        // When & Then
        mockMvc.perform(get("/api/trips/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.destination").value("Tokyo, Japan"))
                .andExpect(jsonPath("$.name").value("Tokyo Adventure"));
        
        verify(tripService).getTripById(1L);
    }
    
    @Test
    void getTripById_NonExistingTrip_ReturnsNotFound() throws Exception {
        // Given
        when(tripService.getTripById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        mockMvc.perform(get("/api/trips/999"))
                .andExpect(status().isNotFound());
        
        verify(tripService).getTripById(999L);
    }
    
    @Test
    void createTrip_ValidTrip_ReturnsCreatedTrip() throws Exception {
        // Given
        Trip newTrip = new Trip();
        newTrip.setName("Rome Vacation");
        newTrip.setDestination("Rome, Italy");
        newTrip.setStartDate(LocalDate.of(2024, 9, 1));
        newTrip.setEndDate(LocalDate.of(2024, 9, 10));
        newTrip.setDescription("Historical adventure");
        
        Trip savedTrip = new Trip();
        savedTrip.setId(3L);
        savedTrip.setName("Rome Vacation");
        savedTrip.setDestination("Rome, Italy");
        savedTrip.setStartDate(LocalDate.of(2024, 9, 1));
        savedTrip.setEndDate(LocalDate.of(2024, 9, 10));
        savedTrip.setDescription("Historical adventure");
        
        when(tripService.createTrip(any(Trip.class))).thenReturn(savedTrip);
        
        // When & Then
        mockMvc.perform(post("/api/trips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTrip)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.destination").value("Rome, Italy"))
                .andExpect(jsonPath("$.name").value("Rome Vacation"));
        
        verify(tripService).createTrip(any(Trip.class));
    }
    
    @Test
    void updateTrip_ExistingTrip_ReturnsUpdatedTrip() throws Exception {
        // Given
        Trip updatedTrip = new Trip();
        updatedTrip.setId(1L);
        updatedTrip.setName("Tokyo Adventure (Updated)");
        updatedTrip.setDestination("Tokyo, Japan (Updated)");
        updatedTrip.setStartDate(LocalDate.of(2024, 6, 15));
        updatedTrip.setEndDate(LocalDate.of(2024, 6, 25));
        updatedTrip.setDescription("Amazing updated cultural experience");
        
        when(tripService.updateTrip(eq(1L), any(Trip.class))).thenReturn(updatedTrip);
        
        // When & Then
        mockMvc.perform(put("/api/trips/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTrip)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.destination").value("Tokyo, Japan (Updated)"))
                .andExpect(jsonPath("$.name").value("Tokyo Adventure (Updated)"));
        
        verify(tripService).updateTrip(eq(1L), any(Trip.class));
    }
    
    @Test
    void updateTrip_NonExistingTrip_ReturnsNotFound() throws Exception {
        // Given
        Trip tripDetails = new Trip();
        tripDetails.setName("Non-existent trip");
        tripDetails.setDestination("Non-existent destination");
        tripDetails.setStartDate(LocalDate.of(2024, 12, 1));
        tripDetails.setEndDate(LocalDate.of(2024, 12, 10));
        
        when(tripService.updateTrip(eq(999L), any(Trip.class)))
                .thenThrow(new RuntimeException("Trip not found"));
        
        // When & Then
        mockMvc.perform(put("/api/trips/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tripDetails)))
                .andExpect(status().isNotFound());
        
        verify(tripService).updateTrip(eq(999L), any(Trip.class));
    }
    
    @Test
    void deleteTrip_ExistingTrip_ReturnsNoContent() throws Exception {
        // Given
        doNothing().when(tripService).deleteTrip(1L);
        
        // When & Then
        mockMvc.perform(delete("/api/trips/1"))
                .andExpect(status().isNoContent());
        
        verify(tripService).deleteTrip(1L);
    }
    
    @Test
    void deleteTrip_NonExistingTrip_ReturnsNotFound() throws Exception {
        // Given
        doThrow(new RuntimeException("Trip not found")).when(tripService).deleteTrip(999L);
        
        // When & Then
        mockMvc.perform(delete("/api/trips/999"))
                .andExpect(status().isNotFound());
        
        verify(tripService).deleteTrip(999L);
    }
    
    @Test
    void searchTrips_WithDestination_ReturnsMatchingTrips() throws Exception {
        // Given
        List<Trip> matchingTrips = Arrays.asList(sampleTrip);
        when(tripService.searchTripsByDestination("Tokyo")).thenReturn(matchingTrips);
        
        // When & Then
        mockMvc.perform(get("/api/trips/search")
                .param("destination", "Tokyo"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].destination").value("Tokyo, Japan"));
        
        verify(tripService).searchTripsByDestination("Tokyo");
    }
    
    @Test
    void searchTrips_NoMatches_ReturnsEmptyList() throws Exception {
        // Given
        when(tripService.searchTripsByDestination("NonExistentPlace")).thenReturn(Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/api/trips/search")
                .param("destination", "NonExistentPlace"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        
        verify(tripService).searchTripsByDestination("NonExistentPlace");
    }
    
    @Test
    void getUpcomingTrips_ReturnsUpcomingTrips() throws Exception {
        // Given
        Trip upcomingTrip = new Trip();
        upcomingTrip.setId(2L);
        upcomingTrip.setDestination("Future Destination");
        upcomingTrip.setStartDate(LocalDate.now().plusDays(30));
        upcomingTrip.setEndDate(LocalDate.now().plusDays(40));
        
        List<Trip> upcomingTrips = Arrays.asList(upcomingTrip);
        when(tripService.getUpcomingTrips()).thenReturn(upcomingTrips);
        
        // When & Then
        mockMvc.perform(get("/api/trips/upcoming"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].destination").value("Future Destination"));
        
        verify(tripService).getUpcomingTrips();
    }
    
    @Test
    void getUpcomingTrips_NoUpcomingTrips_ReturnsEmptyList() throws Exception {
        // Given
        when(tripService.getUpcomingTrips()).thenReturn(Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/api/trips/upcoming"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
        
        verify(tripService).getUpcomingTrips();
    }
}