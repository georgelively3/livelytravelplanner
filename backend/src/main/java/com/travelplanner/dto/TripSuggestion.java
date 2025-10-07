package com.travelplanner.dto;

import java.math.BigDecimal;
import java.util.List;

public class TripSuggestion {
    private String id;
    private String title;
    private String destination;
    private String description;
    private BigDecimal estimatedCost;
    private Integer durationDays;
    private Double confidenceScore;
    private List<String> highlights;
    private List<Activity> activities;
    private List<Accommodation> accommodations;
    private List<Transportation> transportation;
    private List<String> tags;
    private String imageUrl;
    private WeatherInfo weather;
    private BudgetBreakdown budgetBreakdown;
    
    // Constructors
    public TripSuggestion() {}
    
    public TripSuggestion(String id, String title, String destination, String description) {
        this.id = id;
        this.title = title;
        this.destination = destination;
        this.description = description;
    }
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }
    
    public List<Activity> getActivities() { return activities; }
    public void setActivities(List<Activity> activities) { this.activities = activities; }
    
    public List<Accommodation> getAccommodations() { return accommodations; }
    public void setAccommodations(List<Accommodation> accommodations) { this.accommodations = accommodations; }
    
    public List<Transportation> getTransportation() { return transportation; }
    public void setTransportation(List<Transportation> transportation) { this.transportation = transportation; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public WeatherInfo getWeather() { return weather; }
    public void setWeather(WeatherInfo weather) { this.weather = weather; }
    
    public BudgetBreakdown getBudgetBreakdown() { return budgetBreakdown; }
    public void setBudgetBreakdown(BudgetBreakdown budgetBreakdown) { this.budgetBreakdown = budgetBreakdown; }
    
    // Inner classes
    public static class Activity {
        private String name;
        private String description;
        private BigDecimal cost;
        private String duration;
        private String category;
        private String location;
        
        public Activity() {}
        
        public Activity(String name, String description, BigDecimal cost, String duration, String category, String location) {
            this.name = name;
            this.description = description;
            this.cost = cost;
            this.duration = duration;
            this.category = category;
            this.location = location;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }
    
    public static class Accommodation {
        private String name;
        private String type;
        private BigDecimal pricePerNight;
        private Double rating;
        private String location;
        private List<String> amenities;
        
        public Accommodation() {}
        
        public Accommodation(String name, String type, BigDecimal pricePerNight, Double rating, String location) {
            this.name = name;
            this.type = type;
            this.pricePerNight = pricePerNight;
            this.rating = rating;
            this.location = location;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public BigDecimal getPricePerNight() { return pricePerNight; }
        public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
        
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    }
    
    public static class Transportation {
        private String type;
        private String from;
        private String to;
        private BigDecimal cost;
        private String duration;
        private String departureTime;
        private String arrivalTime;
        
        public Transportation() {}
        
        public Transportation(String type, String from, String to, BigDecimal cost, String duration) {
            this.type = type;
            this.from = from;
            this.to = to;
            this.cost = cost;
            this.duration = duration;
        }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
        
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        
        public String getDepartureTime() { return departureTime; }
        public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
        
        public String getArrivalTime() { return arrivalTime; }
        public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    }
    
    public static class WeatherInfo {
        private String season;
        private String averageTemperature;
        private String description;
        private List<String> packingTips;
        
        public WeatherInfo() {}
        
        public WeatherInfo(String season, String averageTemperature, String description) {
            this.season = season;
            this.averageTemperature = averageTemperature;
            this.description = description;
        }
        
        public String getSeason() { return season; }
        public void setSeason(String season) { this.season = season; }
        
        public String getAverageTemperature() { return averageTemperature; }
        public void setAverageTemperature(String averageTemperature) { this.averageTemperature = averageTemperature; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public List<String> getPackingTips() { return packingTips; }
        public void setPackingTips(List<String> packingTips) { this.packingTips = packingTips; }
    }
    
    public static class BudgetBreakdown {
        private BigDecimal accommodation;
        private BigDecimal transportation;
        private BigDecimal activities;
        private BigDecimal food;
        private BigDecimal miscellaneous;
        
        public BudgetBreakdown() {}
        
        public BudgetBreakdown(BigDecimal accommodation, BigDecimal transportation, BigDecimal activities, BigDecimal food, BigDecimal miscellaneous) {
            this.accommodation = accommodation;
            this.transportation = transportation;
            this.activities = activities;
            this.food = food;
            this.miscellaneous = miscellaneous;
        }
        
        public BigDecimal getAccommodation() { return accommodation; }
        public void setAccommodation(BigDecimal accommodation) { this.accommodation = accommodation; }
        
        public BigDecimal getTransportation() { return transportation; }
        public void setTransportation(BigDecimal transportation) { this.transportation = transportation; }
        
        public BigDecimal getActivities() { return activities; }
        public void setActivities(BigDecimal activities) { this.activities = activities; }
        
        public BigDecimal getFood() { return food; }
        public void setFood(BigDecimal food) { this.food = food; }
        
        public BigDecimal getMiscellaneous() { return miscellaneous; }
        public void setMiscellaneous(BigDecimal miscellaneous) { this.miscellaneous = miscellaneous; }
    }
}