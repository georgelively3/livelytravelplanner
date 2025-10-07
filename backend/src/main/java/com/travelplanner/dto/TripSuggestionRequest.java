package com.travelplanner.dto;

import java.util.List;

public class TripSuggestionRequest {
    private String destination;
    private Double budget;
    private Integer duration; // days
    private String travelStyle;
    private List<String> interests;
    private TravelDates travelDates;
    private Integer numberOfTravelers;
    private List<String> accessibility;
    private Long userPersonaId;
    
    // Constructors
    public TripSuggestionRequest() {}
    
    // Getters and setters
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public String getTravelStyle() { return travelStyle; }
    public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle; }
    
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    
    public TravelDates getTravelDates() { return travelDates; }
    public void setTravelDates(TravelDates travelDates) { this.travelDates = travelDates; }
    
    public Integer getNumberOfTravelers() { return numberOfTravelers; }
    public void setNumberOfTravelers(Integer numberOfTravelers) { this.numberOfTravelers = numberOfTravelers; }
    
    public List<String> getAccessibility() { return accessibility; }
    public void setAccessibility(List<String> accessibility) { this.accessibility = accessibility; }
    
    public Long getUserPersonaId() { return userPersonaId; }
    public void setUserPersonaId(Long userPersonaId) { this.userPersonaId = userPersonaId; }
    
    // Inner class for travel dates
    public static class TravelDates {
        private String startDate;
        private String endDate;
        
        public TravelDates() {}
        
        public TravelDates(String startDate, String endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
        }
        
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }
}