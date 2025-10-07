package com.travelplanner.controller;

import com.travelplanner.entity.Trip;
import com.travelplanner.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:4200")
public class TripController {
    
    @Autowired
    private TripService tripService;
    
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        Optional<Trip> trip = tripService.getTripById(id);
        return trip.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Trip> createTrip(@Valid @RequestBody Trip trip) {
        Trip savedTrip = tripService.createTrip(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrip);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @Valid @RequestBody Trip tripDetails) {
        try {
            Trip updatedTrip = tripService.updateTrip(id, tripDetails);
            return ResponseEntity.ok(updatedTrip);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        try {
            tripService.deleteTrip(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Trip>> searchTrips(@RequestParam String destination) {
        List<Trip> trips = tripService.searchTripsByDestination(destination);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Trip>> getUpcomingTrips() {
        List<Trip> trips = tripService.getUpcomingTrips();
        return ResponseEntity.ok(trips);
    }
}