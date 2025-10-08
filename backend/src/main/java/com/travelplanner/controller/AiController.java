package com.travelplanner.controller;

import com.travelplanner.dto.AISuggestionsResponse;
import com.travelplanner.dto.TripSuggestion;
import com.travelplanner.dto.TripSuggestionRequest;
import com.travelplanner.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:4200")
public class AiController {
    
    @Autowired
    private AiService aiService;
    
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
}