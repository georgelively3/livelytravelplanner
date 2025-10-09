package com.travelplanner.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.config.GoogleAiConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GoogleAiService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleAiService.class);
    private static final String GEMINI_MODEL = "gemini-2.5-flash";
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    
    private final WebClient webClient;
    private final GoogleAiConfig config;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public GoogleAiService(WebClient googleAiWebClient, GoogleAiConfig config, ObjectMapper objectMapper) {
        this.webClient = googleAiWebClient;
        this.config = config;
        this.objectMapper = objectMapper;
    }
    
    public Map<String, Object> generateTripPlan(Map<String, Object> travelerProfile, Map<String, Object> tripParameters) {
        logger.info("Starting trip plan generation - API key configured: {}", config.isApiKeyConfigured());
        logger.info("API key value (first 10 chars): {}", config.getApiKey() != null ? config.getApiKey().substring(0, Math.min(10, config.getApiKey().length())) : "null");
        
        if (!config.isApiKeyConfigured()) {
            logger.warn("Google AI API key not configured, falling back to stub implementation");
            return generateFallbackTripPlan(travelerProfile, tripParameters);
        }
        
        // FOR DEBUGGING: Force use real API for now
        logger.info("API key is configured, proceeding with Google AI API call");
        
        try {
            String prompt = buildTripPlanPrompt(travelerProfile, tripParameters);
            logger.info("Built prompt for Google AI API call");
            return callGoogleAiApi(prompt, tripParameters);
        } catch (Exception e) {
            logger.error("Error calling Google AI API, falling back to stub implementation", e);
            // Add the exception details to the fallback response for debugging
            Map<String, Object> fallback = generateFallbackTripPlan(travelerProfile, tripParameters);
            fallback.put("aiModel", "Fallback Service (Google AI error: " + e.getMessage() + ")");
            return fallback;
        }
    }
    
    private String buildTripPlanPrompt(Map<String, Object> travelerProfile, Map<String, Object> tripParameters) {
        String destination = (String) tripParameters.get("destination");
        Integer duration = (Integer) tripParameters.get("duration");
        @SuppressWarnings("unchecked")
        List<String> interests = (List<String>) tripParameters.get("interests");
        Object budgetObj = tripParameters.get("budget");
        Double budget = extractBudget(budgetObj);
        String startDate = (String) tripParameters.get("startDate");
        
        String travelerInterests = interests != null ? String.join(", ", interests) : "general tourism";
        String budgetInfo = budget != null ? String.format("$%.2f", budget) : "moderate budget";
        
        return String.format("""
            Create a detailed %d-day travel itinerary for %s starting on %s.
            
            Traveler Profile:
            - Interests: %s
            - Budget: %s
            
            Requirements:
            - Provide exactly %d days of activities
            - Include 3-4 activities per day (morning, lunch, afternoon, dinner)
            - Include specific restaurant recommendations with local cuisine
            - Include attraction names, opening hours, and estimated costs
            - Include transportation tips between locations
            - Format as a structured daily plan
            
            Return ONLY a JSON response with this exact structure:
            {
              "success": true,
              "destination": "%s",
              "duration": %d,
              "startDate": "%s",
              "endDate": "%s",
              "totalBudget": %.2f,
              "dailyItineraries": [
                {
                  "day": "Day 1",
                  "date": "%s",
                  "activities": [
                    {
                      "name": "Activity Name",
                      "description": "Detailed description",
                      "type": "attraction|restaurant|cultural|outdoor",
                      "location": "Specific address or area in %s",
                      "startTime": "09:00",
                      "endTime": "12:00",
                      "estimatedCost": 25.0,
                      "duration": "3h"
                    }
                  ]
                }
              ],
              "generatedAt": "%s",
              "aiModel": "Google Gemini"
            }
            
            Make sure all activities are real, specific to %s, and include actual restaurant names, attraction names, and accurate cost estimates.
            """, 
            duration, destination, startDate, travelerInterests, budgetInfo, duration,
            destination, duration, startDate, calculateEndDate(startDate, duration), 
            budget != null ? budget : 1000.0, startDate, destination,
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), destination);
    }
    
    private Map<String, Object> callGoogleAiApi(String prompt, Map<String, Object> tripParameters) {
        try {
            Map<String, Object> request = buildGeminiRequest(prompt);
            
            // Build the URL with API key as query parameter
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", 
                GEMINI_MODEL, config.getApiKey());
            
            logger.info("Making Google AI API call to URL: {}", url.replaceAll("key=.*", "key=***"));
            logger.debug("Request payload: {}", objectMapper.writeValueAsString(request));
            
            // Create a simple WebClient without headers since we're using query param
            WebClient simpleWebClient = WebClient.builder().build();
            
            String response = simpleWebClient.post()
                .uri(url)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(TIMEOUT)
                .block();
            
            logger.info("Received response from Google AI API, length: {}", response != null ? response.length() : 0);
            return parseGeminiResponse(response, tripParameters);
            
        } catch (Exception e) {
            logger.error("Failed to call Google AI API", e);
            throw new RuntimeException("Google AI API call failed", e);
        }
    }
    
    private Map<String, Object> buildGeminiRequest(String prompt) {
        // Simplified request structure for Gemini API using mutable maps
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        Map<String, Object> request = new HashMap<>();
        request.put("contents", List.of(content));
        
        return request;
    }
    
    private Map<String, Object> parseGeminiResponse(String response, Map<String, Object> tripParameters) throws JsonProcessingException {
        JsonNode jsonResponse = objectMapper.readTree(response);
        
        // Extract the generated text from Gemini response structure
        JsonNode candidates = jsonResponse.get("candidates");
        if (candidates == null || !candidates.isArray() || candidates.size() == 0) {
            throw new RuntimeException("Invalid response structure from Google AI");
        }
        
        JsonNode firstCandidate = candidates.get(0);
        JsonNode content = firstCandidate.get("content");
        JsonNode parts = content.get("parts");
        JsonNode firstPart = parts.get(0);
        String generatedText = firstPart.get("text").asText();
        
        // Parse the JSON from the generated text
        try {
            // Clean up the response - remove markdown code blocks if present
            String cleanedText = generatedText.trim();
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText.substring(7);
            }
            if (cleanedText.endsWith("```")) {
                cleanedText = cleanedText.substring(0, cleanedText.length() - 3);
            }
            cleanedText = cleanedText.trim();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> tripPlan = objectMapper.readValue(cleanedText, Map.class);
            
            // Validate and enhance the response
            return validateAndEnhanceTripPlan(tripPlan, tripParameters);
            
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse JSON from AI response, using fallback", e);
            return generateFallbackTripPlan(null, tripParameters);
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> validateAndEnhanceTripPlan(Map<String, Object> tripPlan, Map<String, Object> tripParameters) {
        // Ensure required fields are present
        tripPlan.putIfAbsent("success", true);
        tripPlan.putIfAbsent("destination", tripParameters.get("destination"));
        tripPlan.putIfAbsent("duration", tripParameters.get("duration"));
        tripPlan.putIfAbsent("startDate", tripParameters.get("startDate"));
        tripPlan.putIfAbsent("endDate", tripParameters.get("endDate"));
        tripPlan.putIfAbsent("totalBudget", extractBudget(tripParameters.get("budget")));
        tripPlan.putIfAbsent("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        tripPlan.putIfAbsent("aiModel", "Google Gemini");
        
        // Validate dailyItineraries structure
        List<Map<String, Object>> dailyItineraries = (List<Map<String, Object>>) tripPlan.get("dailyItineraries");
        if (dailyItineraries == null || dailyItineraries.isEmpty()) {
            logger.warn("AI response missing dailyItineraries, using fallback");
            return generateFallbackTripPlan(null, tripParameters);
        }
        
        return tripPlan;
    }
    
    // Fallback implementation for when AI is not available
    private Map<String, Object> generateFallbackTripPlan(Map<String, Object> travelerProfile, Map<String, Object> tripParameters) {
        String destination = (String) tripParameters.get("destination");
        Integer duration = (Integer) tripParameters.get("duration");
        @SuppressWarnings("unchecked")
        List<String> interests = (List<String>) tripParameters.get("interests");
        Double budget = extractBudget(tripParameters.get("budget"));
        String startDate = (String) tripParameters.get("startDate");
        String endDate = (String) tripParameters.get("endDate");
        
        List<Map<String, Object>> dailyItineraries = new ArrayList<>();
        
        for (int day = 1; day <= duration; day++) {
            List<Map<String, Object>> activities = generateFallbackDayActivities(destination, interests, day);
            
            Map<String, Object> dayItinerary = new HashMap<>();
            dayItinerary.put("day", "Day " + day);
            dayItinerary.put("date", calculateDate(startDate, day - 1));
            dayItinerary.put("activities", activities);
            
            dailyItineraries.add(dayItinerary);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("destination", destination);
        result.put("duration", duration);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalBudget", budget != null ? budget : 1000.0);
        result.put("dailyItineraries", dailyItineraries);
        result.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        result.put("aiModel", "Fallback Service (Google AI unavailable)");
        
        return result;
    }
    
    private List<Map<String, Object>> generateFallbackDayActivities(String destination, List<String> interests, int dayNumber) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Generate morning activity
        activities.add(createFallbackActivity(
            "Morning Exploration", 
            "Start your day exploring the historic center of " + destination,
            "attraction",
            destination,
            "09:00",
            "12:00"
        ));
        
        // Generate lunch restaurant
        activities.add(createFallbackActivity(
            getFallbackRestaurantName(destination, interests),
            "Enjoy authentic local cuisine at this highly-rated restaurant",
            "restaurant", 
            destination,
            "12:30",
            "14:00"
        ));
        
        // Generate afternoon activity based on interests
        String afternoonActivity = getFallbackAfternoonActivity(destination, interests, dayNumber);
        activities.add(createFallbackActivity(
            afternoonActivity,
            "Afternoon activity tailored to your interests in " + destination,
            getFallbackActivityType(interests),
            destination,
            "15:00", 
            "18:00"
        ));
        
        // Generate dinner restaurant
        activities.add(createFallbackActivity(
            getFallbackDinnerRestaurant(destination),
            "End your day with a memorable dining experience",
            "restaurant",
            destination,
            "19:30",
            "21:30"
        ));
        
        return activities;
    }
    
    private Map<String, Object> createFallbackActivity(String name, String description, String type, 
                                             String location, String startTime, String endTime) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("name", name);
        activity.put("description", description);
        activity.put("type", type);
        activity.put("location", location);
        activity.put("startTime", startTime);
        activity.put("endTime", endTime);
        activity.put("estimatedCost", getFallbackEstimatedCost(type));
        activity.put("duration", calculateDuration(startTime, endTime));
        return activity;
    }
    
    private String getFallbackRestaurantName(String destination, List<String> interests) {
        if (destination.toLowerCase().contains("lisbon")) {
            return "Pastéis de Belém";
        } else if (destination.toLowerCase().contains("paris")) {
            return "Le Comptoir du Relais";
        } else {
            return "Local Cuisine Restaurant";
        }
    }
    
    private String getFallbackAfternoonActivity(String destination, List<String> interests, int dayNumber) {
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
    
    private String getFallbackDinnerRestaurant(String destination) {
        if (destination.toLowerCase().contains("lisbon")) {
            return "Taberna do Real Fado";
        } else if (destination.toLowerCase().contains("paris")) {
            return "L'Ami Jean";
        } else {
            return "Traditional Local Restaurant";
        }
    }
    
    private String getFallbackActivityType(List<String> interests) {
        if (interests != null) {
            if (interests.contains("museums") || interests.contains("art")) {
                return "cultural";
            } else if (interests.contains("outdoor") || interests.contains("hiking")) {
                return "outdoor";
            }
        }
        return "attraction";
    }
    
    private double getFallbackEstimatedCost(String type) {
        switch (type) {
            case "restaurant": return 35.0;
            case "cultural": 
            case "museum": return 15.0;
            case "attraction": return 20.0;
            case "outdoor": return 10.0;
            default: return 25.0;
        }
    }
    
    // Utility methods
    private Double extractBudget(Object budgetObj) {
        if (budgetObj instanceof Integer) {
            return ((Integer) budgetObj).doubleValue();
        } else if (budgetObj instanceof Double) {
            return (Double) budgetObj;
        }
        return null;
    }
    
    private String calculateEndDate(String startDate, int duration) {
        // Simple implementation - in production use LocalDate
        return startDate; // For now
    }
    
    private String calculateDate(String startDate, int daysToAdd) {
        // Simple implementation - in production use LocalDate
        return startDate; // For now
    }
    
    private String calculateDuration(String startTime, String endTime) {
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
}