package com.travelplanner.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AISuggestionsResponse {
    private List<TripSuggestion> suggestions;
    private int totalCount;
    private String generatedAt;
    private Metadata metadata;
    
    // Constructors
    public AISuggestionsResponse() {}
    
    public AISuggestionsResponse(List<TripSuggestion> suggestions, int totalCount, String generatedAt, Metadata metadata) {
        this.suggestions = suggestions;
        this.totalCount = totalCount;
        this.generatedAt = generatedAt;
        this.metadata = metadata;
    }
    
    // Getters and setters
    public List<TripSuggestion> getSuggestions() { return suggestions; }
    public void setSuggestions(List<TripSuggestion> suggestions) { this.suggestions = suggestions; }
    
    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
    
    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
    
    public Metadata getMetadata() { return metadata; }
    public void setMetadata(Metadata metadata) { this.metadata = metadata; }
    
    // Inner class for metadata
    public static class Metadata {
        private TripSuggestionRequest searchCriteria;
        private long processingTime;
        private String aiModel;
        
        public Metadata() {}
        
        public Metadata(TripSuggestionRequest searchCriteria, long processingTime, String aiModel) {
            this.searchCriteria = searchCriteria;
            this.processingTime = processingTime;
            this.aiModel = aiModel;
        }
        
        public TripSuggestionRequest getSearchCriteria() { return searchCriteria; }
        public void setSearchCriteria(TripSuggestionRequest searchCriteria) { this.searchCriteria = searchCriteria; }
        
        public long getProcessingTime() { return processingTime; }
        public void setProcessingTime(long processingTime) { this.processingTime = processingTime; }
        
        public String getAiModel() { return aiModel; }
        public void setAiModel(String aiModel) { this.aiModel = aiModel; }
    }
}