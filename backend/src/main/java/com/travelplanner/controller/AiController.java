package com.travelplanner.controller;

import com.travelplanner.config.GoogleAiConfig;
import com.travelplanner.dto.AISuggestionsResponse;
import com.travelplanner.dto.TripSuggestion;
import com.travelplanner.dto.TripSuggestionRequest;
import com.travelplanner.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AiController {
    
    @Autowired
    private AiService aiService;
    
    @Autowired
    private GoogleAiConfig googleAiConfig;
    
    @PostMapping("/suggestions")
    public ResponseEntity<AISuggestionsResponse> getTripSuggestions(@RequestBody TripSuggestionRequest request) {
        AISuggestionsResponse response = aiService.getTripSuggestions(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/trending")
    public ResponseEntity<List<TripSuggestion>> getTrendingDestinations() {
        List<TripSuggestion> trending = aiService.getTrendingDestinations();
        return ResponseEntity.ok(trending);
    }
    
    @GetMapping("/personalized")
    public ResponseEntity<List<TripSuggestion>> getPersonalizedSuggestions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) List<String> interests) {
        // If no parameters provided, return empty list instead of error
        if (userId == null && (interests == null || interests.isEmpty())) {
            return ResponseEntity.ok(List.of());
        }
        List<TripSuggestion> personalized = aiService.getPersonalizedSuggestions(userId, interests);
        return ResponseEntity.ok(personalized);
    }
    
    @GetMapping("/destinations")
    public ResponseEntity<List<String>> getPopularDestinations() {
        List<String> destinations = aiService.getPopularDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    @PostMapping("/activities")
    public ResponseEntity<List<TripSuggestion>> getActivityRecommendations(
            @RequestBody Map<String, Object> request) {
        String destination = (String) request.get("destination");
        @SuppressWarnings("unchecked")
        List<String> interests = (List<String>) request.get("interests");
        
        List<TripSuggestion> activities = aiService.getActivityRecommendations(destination, interests);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping("/optimize")
    public ResponseEntity<Object> optimizeItinerary(@RequestBody Map<String, Object> request) {
        // TODO: Implement itinerary optimization logic
        return ResponseEntity.ok(Map.of("message", "Optimization feature coming soon"));
    }
    
    @PostMapping("/budget")
    public ResponseEntity<Object> getBudgetRecommendations(@RequestBody Map<String, Object> request) {
        // TODO: Implement budget recommendations logic
        return ResponseEntity.ok(Map.of("message", "Budget recommendations feature coming soon"));
    }
    
    @PostMapping("/save-trip")
    public ResponseEntity<Object> saveTripFromSuggestion(@RequestBody Map<String, Object> suggestion) {
        try {
            // For now, return a success response
            // TODO: Implement actual trip saving logic
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Trip saved successfully",
                "tripId", System.currentTimeMillis() // temporary ID
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to save trip: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/trip-plan")
    public ResponseEntity<Object> generateTripPlan(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> travelerProfile = (Map<String, Object>) request.get("travelerProfile");
            @SuppressWarnings("unchecked")
            Map<String, Object> tripParameters = (Map<String, Object>) request.get("tripParameters");
            
            if (travelerProfile == null || tripParameters == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Missing travelerProfile or tripParameters in request");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            String destination = (String) tripParameters.get("destination");
            Integer duration = (Integer) tripParameters.get("duration");
            @SuppressWarnings("unchecked")
            List<String> interests = (List<String>) tripParameters.get("interests");
            
            // Generate AI trip plan using the simplest approach
            Object tripPlan = aiService.generateTripPlan(travelerProfile, tripParameters);
            
            return ResponseEntity.ok(tripPlan);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate trip plan: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/test-google-ai")
    public ResponseEntity<Object> testGoogleAi() {
        try {
            // Test 1: Basic info using mutable HashMap
            Map<String, Object> basicInfo = new HashMap<>();
            basicInfo.put("success", true);
            basicInfo.put("message", "Google AI endpoint is reachable");
            basicInfo.put("timestamp", System.currentTimeMillis());
            basicInfo.put("apiKeyConfigured", googleAiConfig.isApiKeyConfigured());
            basicInfo.put("apiKeyLength", googleAiConfig.getApiKey() != null ? googleAiConfig.getApiKey().length() : 0);
            
            System.out.println("TEST: Basic API info - " + basicInfo);
            
            // Test 2: Try to make a simple Google AI call
            if (googleAiConfig.isApiKeyConfigured()) {
                try {
                    System.out.println("TEST: Attempting Google AI API call...");
                    
                    // Create a very simple test request using mutable maps
                    WebClient simpleClient = WebClient.builder().build();
                    String apiKey = googleAiConfig.getApiKey();
                    String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
                    
                    Map<String, Object> textPart = new HashMap<>();
                    textPart.put("text", "Hello, respond with 'Test successful'");
                    
                    Map<String, Object> contentPart = new HashMap<>();
                    contentPart.put("parts", List.of(textPart));
                    
                    Map<String, Object> testRequest = new HashMap<>();
                    testRequest.put("contents", List.of(contentPart));
                    
                    System.out.println("TEST: Making request to URL: " + url.substring(0, url.lastIndexOf("=") + 1) + "***");
                    
                    String response = simpleClient.post()
                        .uri(url)
                        .bodyValue(testRequest)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(10))
                        .block();
                    
                    System.out.println("TEST: Google AI response: " + response);
                    
                    basicInfo.put("googleAiTest", "SUCCESS");
                    basicInfo.put("googleAiResponse", response);
                    
                } catch (Exception apiError) {
                    System.out.println("TEST: Google AI API error: " + apiError.getMessage());
                    basicInfo.put("googleAiTest", "FAILED");
                    basicInfo.put("googleAiError", apiError.getMessage());
                }
            } else {
                basicInfo.put("googleAiTest", "SKIPPED - No API key");
            }
            
            return ResponseEntity.ok(basicInfo);
        } catch (Exception e) {
            System.out.println("TEST: General error: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Google AI test failed: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}