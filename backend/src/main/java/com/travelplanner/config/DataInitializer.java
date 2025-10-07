package com.travelplanner.config;

import com.travelplanner.entity.TravelerProfile;
import com.travelplanner.repository.TravelerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TravelerProfileRepository travelerProfileRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default traveler profiles if none exist
        if (travelerProfileRepository.count() == 0) {
            initializeTravelerProfiles();
        }
    }

    private void initializeTravelerProfiles() {
        TravelerProfile[] profiles = {
            new TravelerProfile("Adventure Seeker", 
                "Loves outdoor activities, extreme sports, and off-the-beaten-path destinations. Prefers active vacations with hiking, climbing, or water sports."),
            new TravelerProfile("Cultural Explorer", 
                "Passionate about history, art, museums, and local traditions. Enjoys guided tours, historical sites, and authentic cultural experiences."),
            new TravelerProfile("Luxury Traveler", 
                "Seeks premium accommodations, fine dining, and exclusive experiences. Values comfort, service, and high-quality amenities."),
            new TravelerProfile("Budget Backpacker", 
                "Prefers economical travel options, hostels, and local transportation. Enjoys meeting other travelers and exploring on a budget."),
            new TravelerProfile("Family Vacationer", 
                "Plans trips with children in mind. Looks for family-friendly accommodations, activities, and safe, convenient destinations."),
            new TravelerProfile("Business Traveler", 
                "Travels for work with limited leisure time. Prefers efficient transportation, business-class amenities, and convenient locations."),
            new TravelerProfile("Wellness Seeker", 
                "Focuses on health and relaxation. Interested in spas, yoga retreats, healthy cuisine, and stress-free environments."),
            new TravelerProfile("Food & Wine Enthusiast", 
                "Travels to experience local cuisine and beverages. Enjoys cooking classes, wine tours, and food markets.")
        };

        for (TravelerProfile profile : profiles) {
            travelerProfileRepository.save(profile);
        }
    }
}