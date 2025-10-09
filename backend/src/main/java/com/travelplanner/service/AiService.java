package com.travelplanner.service;

import com.travelplanner.dto.AISuggestionsResponse;
import com.travelplanner.dto.TripSuggestion;
import com.travelplanner.dto.TripSuggestionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiService {
    
    private static final String AI_MODEL_VERSION = "TravelPlanner-AI-v1.0";
    
    private final GoogleAiService googleAiService;
    
    @Autowired
    public AiService(GoogleAiService googleAiService) {
        this.googleAiService = googleAiService;
    }
    
    // Delegate the main AI trip planning to GoogleAiService
    public Map<String, Object> generateTripPlan(Map<String, Object> travelerProfile, Map<String, Object> tripParameters) {
        return googleAiService.generateTripPlan(travelerProfile, tripParameters);
    }
    
    // Keep existing methods for backward compatibility
    public AISuggestionsResponse getTripSuggestions(TripSuggestionRequest request) {
        long startTime = System.currentTimeMillis();
        
        List<TripSuggestion> suggestions = generateTripSuggestions(request);
        
        long processingTime = System.currentTimeMillis() - startTime;
        String generatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        
        AISuggestionsResponse.Metadata metadata = new AISuggestionsResponse.Metadata(
            request, processingTime, AI_MODEL_VERSION
        );
        
        return new AISuggestionsResponse(suggestions, suggestions.size(), generatedAt, metadata);
    }
    
    public List<TripSuggestion> getTrendingDestinations() {
        List<TripSuggestion> trending = new ArrayList<>();
        
        // Paris, France
        TripSuggestion paris = createTripSuggestion(
            "Paris City of Light Adventure",
            "Paris, France",
            "Experience the magic of Paris with iconic landmarks, world-class museums, and exquisite cuisine. Perfect for art lovers and romantics.",
            new BigDecimal("1200"),
            5,
            0.92
        );
        paris.setHighlights(Arrays.asList("Eiffel Tower", "Louvre Museum", "Notre-Dame", "Seine River Cruise"));
        paris.setTags(Arrays.asList("Culture", "Romance", "Art", "History"));
        paris.setImageUrl("https://images.unsplash.com/photo-1502602898536-47ad22581b52");
        trending.add(paris);
        
        // Tokyo, Japan
        TripSuggestion tokyo = createTripSuggestion(
            "Modern Tokyo Cultural Experience",
            "Tokyo, Japan",
            "Immerse yourself in the perfect blend of ancient traditions and cutting-edge technology in Japan's vibrant capital.",
            new BigDecimal("1800"),
            7,
            0.89
        );
        tokyo.setHighlights(Arrays.asList("Shibuya Crossing", "Tokyo Skytree", "Senso-ji Temple", "Tsukiji Fish Market"));
        tokyo.setTags(Arrays.asList("Culture", "Technology", "Food", "Adventure"));
        tokyo.setImageUrl("https://images.unsplash.com/photo-1540959733332-eab4deabeeaf");
        trending.add(tokyo);
        
        // Santorini, Greece
        TripSuggestion santorini = createTripSuggestion(
            "Santorini Sunset Paradise",
            "Santorini, Greece",
            "Relax in this stunning Greek island paradise with breathtaking sunsets, white-washed buildings, and crystal-clear waters.",
            new BigDecimal("900"),
            4,
            0.95
        );
        santorini.setHighlights(Arrays.asList("Oia Sunset", "Red Beach", "Wine Tasting", "Caldera Views"));
        santorini.setTags(Arrays.asList("Beach", "Romance", "Relaxation", "Photography"));
        santorini.setImageUrl("https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff");
        trending.add(santorini);
        
        return trending;
    }
    
    public List<TripSuggestion> getPersonalizedSuggestions(String userId, List<String> interests) {
        List<TripSuggestion> personalized = new ArrayList<>();
        
        if (interests.contains("Adventure")) {
            TripSuggestion adventure = createTripSuggestion(
                "New Zealand Adventure Quest",
                "Queenstown, New Zealand",
                "Experience the adventure capital of the world with bungee jumping, skydiving, and stunning landscapes.",
                new BigDecimal("2200"),
                10,
                0.88
            );
            adventure.setTags(Arrays.asList("Adventure", "Nature", "Extreme Sports"));
            personalized.add(adventure);
        }
        
        if (interests.contains("Culture")) {
            TripSuggestion culture = createTripSuggestion(
                "Kyoto Traditional Japan",
                "Kyoto, Japan",
                "Discover ancient Japan through traditional temples, gardens, and authentic cultural experiences.",
                new BigDecimal("1500"),
                6,
                0.91
            );
            culture.setTags(Arrays.asList("Culture", "History", "Spirituality"));
            personalized.add(culture);
        }
        
        if (interests.contains("Beach")) {
            TripSuggestion beach = createTripSuggestion(
                "Maldives Tropical Escape",
                "Maldives",
                "Ultimate tropical paradise with overwater bungalows, pristine beaches, and world-class diving.",
                new BigDecimal("3000"),
                8,
                0.93
            );
            beach.setTags(Arrays.asList("Beach", "Luxury", "Relaxation", "Diving"));
            personalized.add(beach);
        }
        
        return personalized;
    }
    
    public List<String> getPopularDestinations() {
        return Arrays.asList(
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
    
    public List<TripSuggestion> getActivityRecommendations(String destination, List<String> interests) {
        List<TripSuggestion> activities = new ArrayList<>();
        
        if (destination.toLowerCase().contains("paris")) {
            if (interests.contains("Art")) {
                TripSuggestion artTour = createTripSuggestion(
                    "Paris Art Museum Tour",
                    "Paris, France",
                    "Comprehensive tour of Paris's world-renowned art museums including the Louvre and Musée d'Orsay.",
                    new BigDecimal("150"),
                    1,
                    0.87
                );
                activities.add(artTour);
            }
        }
        
        return activities;
    }
    
    private List<TripSuggestion> generateTripSuggestions(TripSuggestionRequest request) {
        List<TripSuggestion> suggestions = new ArrayList<>();
        
        String destination = request.getDestination();
        BigDecimal budget = request.getBudget() != null ? BigDecimal.valueOf(request.getBudget()) : null;
        List<String> interests = request.getInterests();
        
        if (destination == null || destination.isEmpty()) {
            suggestions.addAll(generateSuggestionsByInterests(interests, budget));
        } else {
            suggestions.addAll(generateSuggestionsForDestination(destination, budget, interests));
        }
        
        return suggestions;
    }
    
    private List<TripSuggestion> generateSuggestionsByInterests(List<String> interests, BigDecimal budget) {
        List<TripSuggestion> suggestions = new ArrayList<>();
        
        for (String interest : interests) {
            switch (interest.toLowerCase()) {
                case "culture":
                    suggestions.add(createCulturalTrip(budget));
                    break;
                case "adventure":
                    suggestions.add(createAdventureTrip(budget));
                    break;
                case "beach":
                    suggestions.add(createBeachTrip(budget));
                    break;
                case "food":
                    suggestions.add(createFoodTrip(budget));
                    break;
                default:
                    suggestions.add(createGeneralTrip(budget));
                    break;
            }
        }
        
        return suggestions;
    }
    
    private List<TripSuggestion> generateSuggestionsForDestination(String destination, BigDecimal budget, List<String> interests) {
        List<TripSuggestion> suggestions = new ArrayList<>();
        
        TripSuggestion suggestion = createTripSuggestion(
            "Explore " + destination,
            destination,
            "Discover the best of " + destination + " with personalized recommendations based on your interests.",
            budget != null ? budget : new BigDecimal("1000"),
            7,
            0.85
        );
        
        suggestion.setTags(interests);
        suggestions.add(suggestion);
        
        return suggestions;
    }
    
    private TripSuggestion createTripSuggestion(String title, String destination, String description, 
                                               BigDecimal cost, int duration, double confidence) {
        TripSuggestion suggestion = new TripSuggestion();
        suggestion.setId(UUID.randomUUID().toString());
        suggestion.setTitle(title);
        suggestion.setDestination(destination);
        suggestion.setDescription(description);
        suggestion.setEstimatedCost(cost);
        suggestion.setDurationDays(duration);
        suggestion.setConfidenceScore(confidence);
        
        List<TripSuggestion.Activity> activities = new ArrayList<>();
        activities.add(new TripSuggestion.Activity(
            "City Tour", "Guided tour of main attractions", 
            new BigDecimal("50"), "3 hours", "Sightseeing", destination
        ));
        suggestion.setActivities(activities);
        
        List<TripSuggestion.Accommodation> accommodations = new ArrayList<>();
        accommodations.add(new TripSuggestion.Accommodation(
            "City Center Hotel", "Hotel", 
            new BigDecimal("120"), 4.2, "Downtown"
        ));
        suggestion.setAccommodations(accommodations);
        
        TripSuggestion.WeatherInfo weather = new TripSuggestion.WeatherInfo(
            "Spring", "18-22°C", "Mild and pleasant weather"
        );
        suggestion.setWeather(weather);
        
        return suggestion;
    }
    
    private TripSuggestion createCulturalTrip(BigDecimal budget) {
        return createTripSuggestion(
            "Cultural Heritage Experience",
            "Florence, Italy",
            "Immerse yourself in Renaissance art and architecture in the birthplace of the Renaissance.",
            budget != null ? budget : new BigDecimal("1400"),
            6,
            0.89
        );
    }
    
    private TripSuggestion createAdventureTrip(BigDecimal budget) {
        return createTripSuggestion(
            "Mountain Adventure Expedition",
            "Swiss Alps, Switzerland",
            "Experience thrilling mountain adventures with hiking, skiing, and breathtaking Alpine views.",
            budget != null ? budget : new BigDecimal("2000"),
            8,
            0.86
        );
    }
    
    private TripSuggestion createBeachTrip(BigDecimal budget) {
        return createTripSuggestion(
            "Tropical Beach Paradise",
            "Bali, Indonesia",
            "Relax on pristine beaches, explore ancient temples, and enjoy the vibrant local culture.",
            budget != null ? budget : new BigDecimal("1100"),
            9,
            0.91
        );
    }
    
    private TripSuggestion createFoodTrip(BigDecimal budget) {
        return createTripSuggestion(
            "Culinary Journey",
            "Lyon, France",
            "Discover the gastronomic capital of France with cooking classes and restaurant tours.",
            budget != null ? budget : new BigDecimal("1300"),
            5,
            0.88
        );
    }
    
    private TripSuggestion createGeneralTrip(BigDecimal budget) {
        return createTripSuggestion(
            "City Discovery Adventure",
            "Amsterdam, Netherlands",
            "Explore charming canals, world-class museums, and vibrant neighborhoods.",
            budget != null ? budget : new BigDecimal("1000"),
            4,
            0.84
        );
    }
}