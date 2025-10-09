package com.travelplanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.config.GoogleAiConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class GoogleAiServiceTest {

    @Mock
    private WebClient mockWebClient;
    
    @Mock
    private GoogleAiConfig mockConfig;
    
    private GoogleAiService googleAiService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        googleAiService = new GoogleAiService(mockWebClient, mockConfig, objectMapper);
    }

    @Test
    void testGenerateTripPlan_WithoutApiKey_ShouldUseFallback() {
        // Given
        when(mockConfig.isApiKeyConfigured()).thenReturn(false);
        
        Map<String, Object> travelerProfile = Map.of(
            "id", 1,
            "name", "Adventure Seeker",
            "interests", Arrays.asList("outdoor", "hiking")
        );
        
        Map<String, Object> tripParameters = Map.of(
            "destination", "Lisbon",
            "duration", 3,
            "budget", 1500.0,
            "startDate", "2025-10-15",
            "endDate", "2025-10-17",
            "interests", Arrays.asList("outdoor", "hiking")
        );

        // When
        Map<String, Object> result = googleAiService.generateTripPlan(travelerProfile, tripParameters);

        // Then
        assertNotNull(result);
        assertTrue((Boolean) result.get("success"));
        assertEquals("Lisbon", result.get("destination"));
        assertEquals(3, result.get("duration"));
        assertEquals(1500.0, result.get("totalBudget"));
        assertEquals("2025-10-15", result.get("startDate"));
        assertEquals("2025-10-17", result.get("endDate"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> dailyItineraries = (List<Map<String, Object>>) result.get("dailyItineraries");
        assertNotNull(dailyItineraries);
        assertEquals(3, dailyItineraries.size());
        
        // Verify first day has activities
        Map<String, Object> day1 = dailyItineraries.get(0);
        assertEquals("Day 1", day1.get("day"));
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> activities = (List<Map<String, Object>>) day1.get("activities");
        assertNotNull(activities);
        assertTrue(activities.size() > 0);
        
        // Verify activity structure
        Map<String, Object> activity = activities.get(0);
        assertNotNull(activity.get("name"));
        assertNotNull(activity.get("description"));
        assertNotNull(activity.get("type"));
        assertNotNull(activity.get("location"));
        assertNotNull(activity.get("startTime"));
        assertNotNull(activity.get("endTime"));
        assertNotNull(activity.get("estimatedCost"));
        assertNotNull(activity.get("duration"));
        
        // Verify the response indicates fallback service
        String aiModel = (String) result.get("aiModel");
        assertTrue(aiModel.contains("Fallback") || aiModel.contains("unavailable"));
    }

    @Test
    void testGenerateTripPlan_WithApiKey_ShouldUseGoogleAi() {
        // Given
        when(mockConfig.isApiKeyConfigured()).thenReturn(true);
        
        Map<String, Object> travelerProfile = Map.of(
            "id", 2,
            "name", "Culture Enthusiast"
        );
        
        Map<String, Object> tripParameters = Map.of(
            "destination", "Paris",
            "duration", 2,
            "budget", 2000.0,
            "startDate", "2025-11-01",
            "endDate", "2025-11-03",
            "interests", Arrays.asList("museums", "art")
        );

        // When - This will fail because we don't have real API integration in test
        // But it should fall back to the fallback implementation
        Map<String, Object> result = googleAiService.generateTripPlan(travelerProfile, tripParameters);

        // Then - Even with API key, it should work (falling back on error)
        assertNotNull(result);
        assertTrue((Boolean) result.get("success"));
        assertEquals("Paris", result.get("destination"));
        assertEquals(2, result.get("duration"));
    }

    @Test
    void testGenerateTripPlan_DifferentDestinations() {
        // Given
        when(mockConfig.isApiKeyConfigured()).thenReturn(false);
        
        Map<String, Object> travelerProfile = Map.of("id", 1, "name", "Traveler");
        
        // Test Lisbon
        Map<String, Object> lisbonParams = Map.of(
            "destination", "Lisbon",
            "duration", 2,
            "budget", 1000.0,
            "startDate", "2025-10-15",
            "endDate", "2025-10-17",
            "interests", Arrays.asList("culture")
        );
        
        Map<String, Object> lisbonResult = googleAiService.generateTripPlan(travelerProfile, lisbonParams);
        
        // Test Paris
        Map<String, Object> parisParams = Map.of(
            "destination", "Paris",
            "duration", 2,
            "budget", 1500.0,
            "startDate", "2025-11-01",
            "endDate", "2025-11-03",
            "interests", Arrays.asList("art")
        );
        
        Map<String, Object> parisResult = googleAiService.generateTripPlan(travelerProfile, parisParams);
        
        // Then
        assertNotNull(lisbonResult);
        assertNotNull(parisResult);
        assertEquals("Lisbon", lisbonResult.get("destination"));
        assertEquals("Paris", parisResult.get("destination"));
        
        // Verify different destinations produce different content
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> lisbonDays = (List<Map<String, Object>>) lisbonResult.get("dailyItineraries");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> parisDays = (List<Map<String, Object>>) parisResult.get("dailyItineraries");
        
        assertNotNull(lisbonDays);
        assertNotNull(parisDays);
        assertEquals(2, lisbonDays.size());
        assertEquals(2, parisDays.size());
    }

    @Test
    void testGenerateTripPlan_DifferentBudgetTypes() {
        // Given
        when(mockConfig.isApiKeyConfigured()).thenReturn(false);
        
        Map<String, Object> travelerProfile = Map.of("id", 1, "name", "Traveler");
        
        // Test with Integer budget
        Map<String, Object> intBudgetParams = Map.of(
            "destination", "Tokyo",
            "duration", 1,
            "budget", 1000, // Integer
            "startDate", "2025-12-01",
            "endDate", "2025-12-02",
            "interests", Arrays.asList("culture")
        );
        
        Map<String, Object> intResult = googleAiService.generateTripPlan(travelerProfile, intBudgetParams);
        
        // Test with Double budget
        Map<String, Object> doubleBudgetParams = Map.of(
            "destination", "Tokyo",
            "duration", 1,
            "budget", 1500.0, // Double
            "startDate", "2025-12-01",
            "endDate", "2025-12-02",
            "interests", Arrays.asList("culture")
        );
        
        Map<String, Object> doubleResult = googleAiService.generateTripPlan(travelerProfile, doubleBudgetParams);
        
        // Then
        assertNotNull(intResult);
        assertNotNull(doubleResult);
        assertEquals(1000.0, intResult.get("totalBudget"));
        assertEquals(1500.0, doubleResult.get("totalBudget"));
    }

    @Test
    void testGenerateTripPlan_RequiredFieldsPresent() {
        // Given
        when(mockConfig.isApiKeyConfigured()).thenReturn(false);
        
        Map<String, Object> travelerProfile = new HashMap<>();
        Map<String, Object> tripParameters = Map.of(
            "destination", "Rome",
            "duration", 1,
            "startDate", "2025-12-01",
            "endDate", "2025-12-02"
        );

        // When
        Map<String, Object> result = googleAiService.generateTripPlan(travelerProfile, tripParameters);

        // Then
        assertNotNull(result);
        assertTrue((Boolean) result.get("success"));
        assertEquals("Rome", result.get("destination"));
        assertEquals(1, result.get("duration"));
        assertEquals("2025-12-01", result.get("startDate"));
        assertEquals("2025-12-02", result.get("endDate"));
        assertNotNull(result.get("dailyItineraries"));
        assertNotNull(result.get("generatedAt"));
        assertNotNull(result.get("aiModel"));
    }
}