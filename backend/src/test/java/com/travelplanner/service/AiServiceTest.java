package com.travelplanner.service;

import com.travelplanner.dto.AISuggestionsResponse;
import com.travelplanner.dto.TripSuggestion;
import com.travelplanner.dto.TripSuggestionRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock
    private GoogleAiService googleAiService;

    @InjectMocks
    private AiService aiService;

    private Map<String, Object> mockTravelerProfile;
    private Map<String, Object> mockTripParameters;
    private Map<String, Object> mockTripPlanResponse;

    @BeforeEach
    void setUp() {
        mockTravelerProfile = new HashMap<>();
        mockTravelerProfile.put("interests", Arrays.asList("culture", "food"));
        mockTravelerProfile.put("budget", 1500);

        mockTripParameters = new HashMap<>();
        mockTripParameters.put("destination", "Paris");
        mockTripParameters.put("duration", 5);

        mockTripPlanResponse = new HashMap<>();
        mockTripPlanResponse.put("destination", "Paris");
        mockTripPlanResponse.put("itinerary", "Detailed travel plan");
    }

    @Test
    void generateTripPlan_ShouldDelegateToGoogleAiService() {
        // Given
        when(googleAiService.generateTripPlan(any(), any())).thenReturn(mockTripPlanResponse);

        // When
        Map<String, Object> result = aiService.generateTripPlan(mockTravelerProfile, mockTripParameters);

        // Then
        assertThat(result).isEqualTo(mockTripPlanResponse);
        verify(googleAiService).generateTripPlan(mockTravelerProfile, mockTripParameters);
    }

    @Test
    void getTripSuggestions_WithValidRequest_ShouldReturnSuggestions() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination("Paris");
        request.setBudget(1200.0);
        request.setInterests(Arrays.asList("culture", "food"));

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getSuggestions()).isNotEmpty();
        assertThat(response.getTotalCount()).isGreaterThan(0);
        assertThat(response.getGeneratedAt()).isNotNull();
        assertThat(response.getMetadata()).isNotNull();
        assertThat(response.getMetadata().getProcessingTime()).isGreaterThanOrEqualTo(0);
        assertThat(response.getMetadata().getAiModel()).isEqualTo("TravelPlanner-AI-v1.0");
    }

    @Test
    void getTripSuggestions_WithoutDestination_ShouldGenerateByInterests() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination(null);
        request.setInterests(Arrays.asList("culture", "adventure"));

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        assertThat(response.getSuggestions()).isNotEmpty();
        assertThat(response.getSuggestions()).hasSize(2); // One for each interest
        
        // Verify we get suggestions based on interests
        List<TripSuggestion> suggestions = response.getSuggestions();
        assertThat(suggestions).anyMatch(s -> s.getTitle().contains("Cultural") || s.getTitle().contains("Florence"));
        assertThat(suggestions).anyMatch(s -> s.getTitle().contains("Adventure") || s.getTitle().contains("Mountain"));
    }

    @Test
    void getTripSuggestions_WithEmptyInterests_ShouldReturnEmptyList() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination(null);
        request.setInterests(Arrays.asList());

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        assertThat(response.getSuggestions()).isEmpty();
        assertThat(response.getTotalCount()).isEqualTo(0);
    }

    @Test
    void getTrendingDestinations_ShouldReturnPopularDestinations() {
        // When
        List<TripSuggestion> trending = aiService.getTrendingDestinations();

        // Then
        assertThat(trending).hasSize(3);
        
        // Verify Paris suggestion
        TripSuggestion paris = trending.stream()
            .filter(t -> t.getDestination().equals("Paris, France"))
            .findFirst()
            .orElse(null);
        assertThat(paris).isNotNull();
        assertThat(paris.getTitle()).contains("Paris");
        assertThat(paris.getHighlights()).contains("Eiffel Tower", "Louvre Museum");
        assertThat(paris.getTags()).contains("Culture", "Romance", "Art", "History");
        assertThat(paris.getEstimatedCost()).isEqualTo(new BigDecimal("1200"));
        assertThat(paris.getDurationDays()).isEqualTo(5);
        assertThat(paris.getConfidenceScore()).isEqualTo(0.92);

        // Verify Tokyo suggestion
        TripSuggestion tokyo = trending.stream()
            .filter(t -> t.getDestination().equals("Tokyo, Japan"))
            .findFirst()
            .orElse(null);
        assertThat(tokyo).isNotNull();
        assertThat(tokyo.getTitle()).contains("Tokyo");
        assertThat(tokyo.getHighlights()).contains("Shibuya Crossing", "Tokyo Skytree");
        assertThat(tokyo.getTags()).contains("Culture", "Technology", "Food", "Adventure");

        // Verify Santorini suggestion
        TripSuggestion santorini = trending.stream()
            .filter(t -> t.getDestination().equals("Santorini, Greece"))
            .findFirst()
            .orElse(null);
        assertThat(santorini).isNotNull();
        assertThat(santorini.getTitle()).contains("Santorini");
        assertThat(santorini.getHighlights()).contains("Oia Sunset", "Red Beach");
        assertThat(santorini.getTags()).contains("Beach", "Romance", "Relaxation", "Photography");
    }

    @Test
    void getPersonalizedSuggestions_WithAdventureInterest_ShouldReturnAdventureSuggestion() {
        // Given
        String userId = "user123";
        List<String> interests = Arrays.asList("Adventure");

        // When
        List<TripSuggestion> suggestions = aiService.getPersonalizedSuggestions(userId, interests);

        // Then
        assertThat(suggestions).hasSize(1);
        TripSuggestion suggestion = suggestions.get(0);
        assertThat(suggestion.getTitle()).contains("New Zealand");
        assertThat(suggestion.getDestination()).isEqualTo("Queenstown, New Zealand");
        assertThat(suggestion.getTags()).contains("Adventure", "Nature", "Extreme Sports");
        assertThat(suggestion.getEstimatedCost()).isEqualTo(new BigDecimal("2200"));
    }

    @Test
    void getPersonalizedSuggestions_WithCultureInterest_ShouldReturnCultureSuggestion() {
        // Given
        String userId = "user123";
        List<String> interests = Arrays.asList("Culture");

        // When
        List<TripSuggestion> suggestions = aiService.getPersonalizedSuggestions(userId, interests);

        // Then
        assertThat(suggestions).hasSize(1);
        TripSuggestion suggestion = suggestions.get(0);
        assertThat(suggestion.getTitle()).contains("Kyoto");
        assertThat(suggestion.getDestination()).isEqualTo("Kyoto, Japan");
        assertThat(suggestion.getTags()).contains("Culture", "History", "Spirituality");
        assertThat(suggestion.getEstimatedCost()).isEqualTo(new BigDecimal("1500"));
    }

    @Test
    void getPersonalizedSuggestions_WithBeachInterest_ShouldReturnBeachSuggestion() {
        // Given
        String userId = "user123";
        List<String> interests = Arrays.asList("Beach");

        // When
        List<TripSuggestion> suggestions = aiService.getPersonalizedSuggestions(userId, interests);

        // Then
        assertThat(suggestions).hasSize(1);
        TripSuggestion suggestion = suggestions.get(0);
        assertThat(suggestion.getTitle()).contains("Maldives");
        assertThat(suggestion.getDestination()).isEqualTo("Maldives");
        assertThat(suggestion.getTags()).contains("Beach", "Luxury", "Relaxation", "Diving");
        assertThat(suggestion.getEstimatedCost()).isEqualTo(new BigDecimal("3000"));
    }

    @Test
    void getPersonalizedSuggestions_WithMultipleInterests_ShouldReturnMultipleSuggestions() {
        // Given
        String userId = "user123";
        List<String> interests = Arrays.asList("Adventure", "Culture", "Beach");

        // When
        List<TripSuggestion> suggestions = aiService.getPersonalizedSuggestions(userId, interests);

        // Then
        assertThat(suggestions).hasSize(3);
        assertThat(suggestions).anyMatch(s -> s.getDestination().equals("Queenstown, New Zealand"));
        assertThat(suggestions).anyMatch(s -> s.getDestination().equals("Kyoto, Japan"));
        assertThat(suggestions).anyMatch(s -> s.getDestination().equals("Maldives"));
    }

    @Test
    void getPersonalizedSuggestions_WithUnknownInterest_ShouldReturnEmptyList() {
        // Given
        String userId = "user123";
        List<String> interests = Arrays.asList("Unknown");

        // When
        List<TripSuggestion> suggestions = aiService.getPersonalizedSuggestions(userId, interests);

        // Then
        assertThat(suggestions).isEmpty();
    }

    @Test
    void getPopularDestinations_ShouldReturnListOfDestinations() {
        // When
        List<String> destinations = aiService.getPopularDestinations();

        // Then
        assertThat(destinations).hasSize(10);
        assertThat(destinations).contains(
            "Paris, France",
            "Tokyo, Japan",
            "New York, USA",
            "London, UK",
            "Rome, Italy",
            "Barcelona, Spain",
            "Amsterdam, Netherlands",
            "Prague, Czech Republic",
            "Istanbul, Turkey",
            "Marrakech, Morocco"
        );
    }

    @Test
    void getActivityRecommendations_ForParis_WithArtInterest_ShouldReturnArtActivity() {
        // Given
        String destination = "Paris";
        List<String> interests = Arrays.asList("Art");

        // When
        List<TripSuggestion> activities = aiService.getActivityRecommendations(destination, interests);

        // Then
        assertThat(activities).hasSize(1);
        TripSuggestion activity = activities.get(0);
        assertThat(activity.getTitle()).contains("Art Museum Tour");
        assertThat(activity.getDestination()).isEqualTo("Paris, France");
        assertThat(activity.getDescription()).contains("Louvre");
        assertThat(activity.getEstimatedCost()).isEqualTo(new BigDecimal("150"));
        assertThat(activity.getDurationDays()).isEqualTo(1);
    }

    @Test
    void getActivityRecommendations_ForParisWithoutArtInterest_ShouldReturnEmptyList() {
        // Given
        String destination = "Paris";
        List<String> interests = Arrays.asList("Food");

        // When
        List<TripSuggestion> activities = aiService.getActivityRecommendations(destination, interests);

        // Then
        assertThat(activities).isEmpty();
    }

    @Test
    void getActivityRecommendations_ForNonParisDestination_ShouldReturnEmptyList() {
        // Given
        String destination = "London";
        List<String> interests = Arrays.asList("Art");

        // When
        List<TripSuggestion> activities = aiService.getActivityRecommendations(destination, interests);

        // Then
        assertThat(activities).isEmpty();
    }

    @Test
    void getTripSuggestions_WithSpecificDestination_ShouldGenerateDestinationSpecificSuggestion() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination("Rome");
        request.setBudget(1500.0);
        request.setInterests(Arrays.asList("history", "culture"));

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        assertThat(response.getSuggestions()).hasSize(1);
        TripSuggestion suggestion = response.getSuggestions().get(0);
        assertThat(suggestion.getTitle()).contains("Rome");
        assertThat(suggestion.getDestination()).isEqualTo("Rome");
        assertThat(suggestion.getEstimatedCost()).isEqualTo(new BigDecimal("1500.0"));
        assertThat(suggestion.getTags()).contains("history", "culture");
    }

    @Test
    void getTripSuggestions_WithNullBudget_ShouldUseDefaultBudget() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination("London");
        request.setBudget(null);
        request.setInterests(Arrays.asList("culture"));

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        assertThat(response.getSuggestions()).hasSize(1);
        TripSuggestion suggestion = response.getSuggestions().get(0);
        assertThat(suggestion.getEstimatedCost()).isEqualTo(new BigDecimal("1000")); // Default budget
    }

    @Test
    void getTripSuggestions_WithVariousInterests_ShouldGenerateAppropriateSuggestions() {
        // Test culture interest
        TripSuggestionRequest cultureRequest = new TripSuggestionRequest();
        cultureRequest.setInterests(Arrays.asList("culture"));
        
        AISuggestionsResponse cultureResponse = aiService.getTripSuggestions(cultureRequest);
        TripSuggestion cultureSuggestion = cultureResponse.getSuggestions().get(0);
        assertThat(cultureSuggestion.getDestination()).isEqualTo("Florence, Italy");

        // Test adventure interest
        TripSuggestionRequest adventureRequest = new TripSuggestionRequest();
        adventureRequest.setInterests(Arrays.asList("adventure"));
        
        AISuggestionsResponse adventureResponse = aiService.getTripSuggestions(adventureRequest);
        TripSuggestion adventureSuggestion = adventureResponse.getSuggestions().get(0);
        assertThat(adventureSuggestion.getDestination()).isEqualTo("Swiss Alps, Switzerland");

        // Test beach interest
        TripSuggestionRequest beachRequest = new TripSuggestionRequest();
        beachRequest.setInterests(Arrays.asList("beach"));
        
        AISuggestionsResponse beachResponse = aiService.getTripSuggestions(beachRequest);
        TripSuggestion beachSuggestion = beachResponse.getSuggestions().get(0);
        assertThat(beachSuggestion.getDestination()).isEqualTo("Bali, Indonesia");

        // Test food interest
        TripSuggestionRequest foodRequest = new TripSuggestionRequest();
        foodRequest.setInterests(Arrays.asList("food"));
        
        AISuggestionsResponse foodResponse = aiService.getTripSuggestions(foodRequest);
        TripSuggestion foodSuggestion = foodResponse.getSuggestions().get(0);
        assertThat(foodSuggestion.getDestination()).isEqualTo("Lyon, France");

        // Test unknown interest (should get general trip)
        TripSuggestionRequest unknownRequest = new TripSuggestionRequest();
        unknownRequest.setInterests(Arrays.asList("unknown"));
        
        AISuggestionsResponse unknownResponse = aiService.getTripSuggestions(unknownRequest);
        TripSuggestion unknownSuggestion = unknownResponse.getSuggestions().get(0);
        assertThat(unknownSuggestion.getDestination()).isEqualTo("Amsterdam, Netherlands");
    }

    @Test
    void tripSuggestions_ShouldHaveRequiredFields() {
        // Given
        TripSuggestionRequest request = new TripSuggestionRequest();
        request.setDestination("Test City");
        request.setInterests(Arrays.asList("culture"));

        // When
        AISuggestionsResponse response = aiService.getTripSuggestions(request);

        // Then
        TripSuggestion suggestion = response.getSuggestions().get(0);
        
        // Verify all required fields are populated
        assertThat(suggestion.getId()).isNotNull();
        assertThat(suggestion.getTitle()).isNotBlank();
        assertThat(suggestion.getDestination()).isNotBlank();
        assertThat(suggestion.getDescription()).isNotBlank();
        assertThat(suggestion.getEstimatedCost()).isNotNull();
        assertThat(suggestion.getDurationDays()).isGreaterThan(0);
        assertThat(suggestion.getConfidenceScore()).isBetween(0.0, 1.0);
        
        // Verify activities are included
        assertThat(suggestion.getActivities()).isNotEmpty();
        TripSuggestion.Activity activity = suggestion.getActivities().get(0);
        assertThat(activity.getName()).isNotBlank();
        assertThat(activity.getDescription()).isNotBlank();
        assertThat(activity.getCost()).isNotNull();
        assertThat(activity.getDuration()).isNotBlank();
        assertThat(activity.getCategory()).isNotBlank();
        assertThat(activity.getLocation()).isNotBlank();

        // Verify accommodations are included
        assertThat(suggestion.getAccommodations()).isNotEmpty();
        TripSuggestion.Accommodation accommodation = suggestion.getAccommodations().get(0);
        assertThat(accommodation.getName()).isNotBlank();
        assertThat(accommodation.getType()).isNotBlank();
        assertThat(accommodation.getPricePerNight()).isNotNull();
        assertThat(accommodation.getRating()).isGreaterThan(0);
        assertThat(accommodation.getLocation()).isNotBlank();

        // Verify weather info is included
        assertThat(suggestion.getWeather()).isNotNull();
        assertThat(suggestion.getWeather().getSeason()).isNotBlank();
        assertThat(suggestion.getWeather().getAverageTemperature()).isNotBlank();
        assertThat(suggestion.getWeather().getDescription()).isNotBlank();
    }
}