package com.travelplanner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.dto.UserPersonaRequest;
import com.travelplanner.repository.TravelerProfileRepository;
import com.travelplanner.repository.UserPersonaRepository;
import com.travelplanner.config.WebSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class to verify DataInitializer dependency for PersonasController.
 * This test captures the production bug where base profiles are not available
 * when DataInitializer component is not active.
 */
@WebMvcTest(value = PersonasController.class, 
           excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, 
                                                classes = WebSecurityConfig.class))
public class PersonasControllerDataInitializerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TravelerProfileRepository travelerProfileRepository;
    
    @MockBean
    private UserPersonaRepository userPersonaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void createPersona_shouldFailWhenBaseProfileNotFound() throws Exception {
        // Arrange: Mock repository to return false (simulating missing base profiles from DataInitializer)
        Long nonExistentBaseProfileId = 1L;
        when(travelerProfileRepository.existsById(nonExistentBaseProfileId)).thenReturn(false);

        UserPersonaRequest request = new UserPersonaRequest();
        request.setBaseProfileId(nonExistentBaseProfileId);
        request.setPersonalPreferences("Adventure seeker");
        request.setBudgetDetails("$2000-$3000");
        request.setConstraints("No dietary restrictions");
        request.setGroupDynamics("Solo traveler");
        request.setAccessibilityNeeds("None");

        // Act & Assert: Expect HTTP 400 with "Base profile not found" message
        // This captures the production bug when DataInitializer is not active
        mockMvc.perform(post("/api/personas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Base profile not found"));
    }

    @Test
    public void createPersona_shouldSucceedWhenBaseProfileExists() throws Exception {
        // Arrange: Mock repository to return true (simulating DataInitializer working properly)
        Long existingBaseProfileId = 1L;
        when(travelerProfileRepository.existsById(existingBaseProfileId)).thenReturn(true);
        when(userPersonaRepository.save(any())).thenReturn(null); // Don't care about return value

        UserPersonaRequest request = new UserPersonaRequest();
        request.setBaseProfileId(existingBaseProfileId);
        request.setPersonalPreferences("Adventure seeker");
        request.setBudgetDetails("$2000-$3000");
        request.setConstraints("No dietary restrictions");
        request.setGroupDynamics("Solo traveler");
        request.setAccessibilityNeeds("None");

        // Act & Assert: Expect HTTP 201 for successful creation
        // This shows the fix working when DataInitializer provides base profiles
        mockMvc.perform(post("/api/personas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}