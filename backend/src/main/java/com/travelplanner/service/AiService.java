package com.travelplanner.service;

import com.travelplanner.dto.AISuggestionsResponse;
import com.travelplanner.dto.TripSuggestion;
import com.travelplanner.dto.TripSuggestionRequest;
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
        // In a real implementation, this would use user's travel history and preferences
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
        
        // Sample activity recommendations based on destination and interests
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
        
        // Generate suggestions based on request parameters
        String destination = request.getDestination();
        BigDecimal budget = request.getBudget() != null ? BigDecimal.valueOf(request.getBudget()) : null;
        List<String> interests = request.getInterests();
        
        // Sample suggestion generation logic
        if (destination == null || destination.isEmpty()) {
            // Generate suggestions based on interests and budget
            suggestions.addAll(generateSuggestionsByInterests(interests, budget));
        } else {
            // Generate suggestions for specific destination
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
        
        // Create destination-specific suggestions
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
        
        // Add sample activities
        List<TripSuggestion.Activity> activities = new ArrayList<>();
        activities.add(new TripSuggestion.Activity(
            "City Tour", "Guided tour of main attractions", 
            new BigDecimal("50"), "3 hours", "Sightseeing", destination
        ));
        suggestion.setActivities(activities);
        
        // Add sample accommodation
        List<TripSuggestion.Accommodation> accommodations = new ArrayList<>();
        accommodations.add(new TripSuggestion.Accommodation(
            "City Center Hotel", "Hotel", 
            new BigDecimal("120"), 4.2, "Downtown"
        ));
        suggestion.setAccommodations(accommodations);
        
        // Add weather info
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
    
    public Object generateTripPlan(Map<String, Object> travelerProfile, Map<String, Object> tripParameters) {
        String destination = (String) tripParameters.get("destination");
        Integer duration = (Integer) tripParameters.get("duration");
        @SuppressWarnings("unchecked")
        List<String> interests = (List<String>) tripParameters.get("interests");
        // Handle budget as either Integer or Double
        Object budgetObj = tripParameters.get("budget");
        Double budget = null;
        if (budgetObj instanceof Integer) {
            budget = ((Integer) budgetObj).doubleValue();
        } else if (budgetObj instanceof Double) {
            budget = (Double) budgetObj;
        }
        String startDate = (String) tripParameters.get("startDate");
        String endDate = (String) tripParameters.get("endDate");
        
        // Generate daily itineraries based on the simplest approach
        List<Map<String, Object>> dailyItineraries = new ArrayList<>();
        
        for (int day = 1; day <= duration; day++) {
            List<Map<String, Object>> activities = generateDayActivities(destination, interests, day);
            
            Map<String, Object> dayItinerary = Map.of(
                "day", "Day " + day,
                "date", calculateDate(startDate, day - 1),
                "activities", activities
            );
            
            dailyItineraries.add(dayItinerary);
        }
        
        return Map.of(
            "success", true,
            "destination", destination,
            "duration", duration,
            "startDate", startDate,
            "endDate", endDate,
            "totalBudget", budget,
            "dailyItineraries", dailyItineraries,
            "generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "aiModel", AI_MODEL_VERSION
        );
    }
    
    private List<Map<String, Object>> generateDayActivities(String destination, List<String> interests, int dayNumber) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Generate morning activity
        activities.add(createActivity(
            "Morning Exploration", 
            "Start your day exploring the historic center of " + destination,
            "attraction",
            destination,
            "09:00",
            "12:00"
        ));
        
        // Generate lunch restaurant
        activities.add(createActivity(
            getRestaurantName(destination, interests),
            "Enjoy authentic local cuisine at this highly-rated restaurant",
            "restaurant", 
            destination,
            "12:30",
            "14:00"
        ));
        
        // Generate afternoon activity based on interests
        String afternoonActivity = getAfternoonActivity(destination, interests, dayNumber);
        activities.add(createActivity(
            afternoonActivity,
            "Afternoon activity tailored to your interests in " + destination,
            getActivityType(interests),
            destination,
            "15:00", 
            "18:00"
        ));
        
        // Generate dinner restaurant
        activities.add(createActivity(
            getDinnerRestaurant(destination),
            "End your day with a memorable dining experience",
            "restaurant",
            destination,
            "19:30",
            "21:30"
        ));
        
        return activities;
    }
    
    private Map<String, Object> createActivity(String name, String description, String type, 
                                             String location, String startTime, String endTime) {
        return Map.of(
            "name", name,
            "description", description,
            "type", type,
            "location", location,
            "startTime", startTime,
            "endTime", endTime,
            "estimatedCost", getEstimatedCost(type),
            "duration", calculateDuration(startTime, endTime)
        );
    }
    
    private String getRestaurantName(String destination, List<String> interests) {
        if (destination.toLowerCase().contains("lisbon")) {
            return "Pastéis de Belém";
        } else if (destination.toLowerCase().contains("paris")) {
            return "Le Comptoir du Relais";
        } else {
            return "Local Cuisine Restaurant";
        }
    }
    
    private String getAfternoonActivity(String destination, List<String> interests, int dayNumber) {
        if (destination.toLowerCase().contains("lisbon")) {
            switch (dayNumber) {
                case 1: return "Explore Belém Tower and Jerónimos Monastery";
                case 2: return "Wander through Alfama's narrow streets";
                case 3: return "Day trip to Sintra Palace";
                default: return "Explore Chiado district";
            }
        } else if (destination.toLowerCase().contains("paris")) {
            switch (dayNumber) {
                case 1: return "Visit the Louvre Museum";
                case 2: return "Climb the Eiffel Tower";
                case 3: return "Stroll through Montmartre";
                default: return "Explore Latin Quarter";
            }
        } else {
            return "Visit main attractions in " + destination;
        }
    }
    
    private String getDinnerRestaurant(String destination) {
        if (destination.toLowerCase().contains("lisbon")) {
            return "Taberna do Real Fado";
        } else if (destination.toLowerCase().contains("paris")) {
            return "L'Ami Jean";
        } else {
            return "Traditional Local Restaurant";
        }
    }
    
    private String getActivityType(List<String> interests) {
        if (interests.contains("museums") || interests.contains("art")) {
            return "cultural";
        } else if (interests.contains("outdoor") || interests.contains("hiking")) {
            return "outdoor";
        } else {
            return "attraction";
        }
    }
    
    private double getEstimatedCost(String type) {
        switch (type) {
            case "restaurant": return 35.0;
            case "cultural": 
            case "museum": return 15.0;
            case "attraction": return 20.0;
            case "outdoor": return 10.0;
            default: return 25.0;
        }
    }
    
    private String calculateDuration(String startTime, String endTime) {
        // Simple duration calculation
        String[] start = startTime.split(":");
        String[] end = endTime.split(":");
        int startMinutes = Integer.parseInt(start[0]) * 60 + Integer.parseInt(start[1]);
        int endMinutes = Integer.parseInt(end[0]) * 60 + Integer.parseInt(end[1]);
        int durationMinutes = endMinutes - startMinutes;
        
        if (durationMinutes >= 60) {
            int hours = durationMinutes / 60;
            int minutes = durationMinutes % 60;
            return hours + "h " + (minutes > 0 ? minutes + "m" : "");
        } else {
            return durationMinutes + "m";
        }
    }
    
    private String calculateDate(String startDate, int daysToAdd) {
        // Simple date calculation - in real implementation use LocalDate
        return startDate; // For simplicity, just return start date for now
    }
}