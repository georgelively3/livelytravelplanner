package com.travelplanner.controller;

import com.travelplanner.dto.UserPersonaRequest;
import com.travelplanner.dto.UserPersonaResponse;
import com.travelplanner.entity.TravelerProfile;
import com.travelplanner.entity.User;
import com.travelplanner.entity.UserPersona;
import com.travelplanner.repository.TravelerProfileRepository;
import com.travelplanner.repository.UserPersonaRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/personas")
public class PersonasController {

    @Autowired
    private UserPersonaRepository userPersonaRepository;

    @Autowired
    private TravelerProfileRepository travelerProfileRepository;

    @GetMapping
    public ResponseEntity<?> getUserPersonas() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        List<UserPersona> personas = userPersonaRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.getId());
        List<UserPersonaResponse> response = personas.stream()
                .map(UserPersonaResponse::new)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("personas", response);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createPersona(@Valid @RequestBody UserPersonaRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        // Validate base profile exists
        TravelerProfile baseProfile = travelerProfileRepository.findById(request.getBaseProfileId())
                .orElse(null);
        
        if (baseProfile == null) {
            return ResponseEntity.badRequest().body("Base profile not found");
        }

        UserPersona persona = new UserPersona(
                currentUser,
                baseProfile,
                request.getPersonalPreferences(),
                request.getConstraints(),
                request.getBudgetDetails(),
                request.getAccessibilityNeeds(),
                request.getGroupDynamics()
        );

        UserPersona savedPersona = userPersonaRepository.save(persona);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Persona created successfully");
        response.put("persona", new UserPersonaResponse(savedPersona));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPersona(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        UserPersona persona = userPersonaRepository.findByUserIdAndId(currentUser.getId(), id);
        if (persona == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("persona", new UserPersonaResponse(persona));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePersona(@PathVariable Long id, @Valid @RequestBody UserPersonaRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        UserPersona persona = userPersonaRepository.findByUserIdAndId(currentUser.getId(), id);
        if (persona == null) {
            return ResponseEntity.notFound().build();
        }

        // Update fields if provided
        if (request.getBaseProfileId() != null) {
            TravelerProfile baseProfile = travelerProfileRepository.findById(request.getBaseProfileId())
                    .orElse(null);
            if (baseProfile != null) {
                persona.setBaseProfile(baseProfile);
            }
        }
        
        if (request.getPersonalPreferences() != null) {
            persona.setPersonalPreferences(request.getPersonalPreferences());
        }
        if (request.getConstraints() != null) {
            persona.setConstraints(request.getConstraints());
        }
        if (request.getBudgetDetails() != null) {
            persona.setBudgetDetails(request.getBudgetDetails());
        }
        if (request.getAccessibilityNeeds() != null) {
            persona.setAccessibilityNeeds(request.getAccessibilityNeeds());
        }
        if (request.getGroupDynamics() != null) {
            persona.setGroupDynamics(request.getGroupDynamics());
        }

        UserPersona updatedPersona = userPersonaRepository.save(persona);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Persona updated successfully");
        response.put("persona", new UserPersonaResponse(updatedPersona));
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
}