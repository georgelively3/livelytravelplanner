package com.travelplanner.service;

import com.travelplanner.entity.Trip;
import com.travelplanner.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TripService {
    
    @Autowired
    private TripRepository tripRepository;
    
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
    
    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }
    
    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }
    
    public Trip updateTrip(Long id, Trip tripDetails) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
        
        trip.setName(tripDetails.getName());
        trip.setDescription(tripDetails.getDescription());
        trip.setStartDate(tripDetails.getStartDate());
        trip.setEndDate(tripDetails.getEndDate());
        trip.setDestination(tripDetails.getDestination());
        
        return tripRepository.save(trip);
    }
    
    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
        tripRepository.delete(trip);
    }
    
    public List<Trip> searchTripsByDestination(String destination) {
        return tripRepository.findByDestinationContainingIgnoreCase(destination);
    }
    
    public List<Trip> getUpcomingTrips() {
        return tripRepository.findByStartDateAfter(LocalDate.now());
    }
}