package com.travelplanner.controller;

import com.travelplanner.model.TravelerProfile;
import com.travelplanner.repository.TravelerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profiles")
public class ProfilesController {

    @Autowired
    private TravelerProfileRepository travelerProfileRepository;

    @GetMapping
    public ResponseEntity<?> getAllProfiles() {
        List<TravelerProfile> profiles = travelerProfileRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("profiles", profiles);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        TravelerProfile profile = travelerProfileRepository.findById(id).orElse(null);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("profile", profile);
        return ResponseEntity.ok(response);
    }
}