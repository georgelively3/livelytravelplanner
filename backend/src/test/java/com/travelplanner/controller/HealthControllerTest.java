package com.travelplanner.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    private MockMvc mockMvc;
    
    @InjectMocks
    private HealthController healthController;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(healthController).build();
    }
    
    @Test
    void health_ReturnsHealthStatus() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("Travel Planner Backend"))
                .andExpect(jsonPath("$.version").value("1.0.0"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}