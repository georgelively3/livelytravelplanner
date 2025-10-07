package com.travelplanner.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test to verify DataInitializer dependency.
 * This test demonstrates the importance of DataInitializer for providing base profiles
 * required by the PersonasController.
 */
@SpringBootTest
@AutoConfigureWebMvc
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb"
})
public class DataInitializerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Test
    public void profilesEndpoint_shouldReturnBaseProfiles_whenDataInitializerIsActive() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Get the response to debug
        String response = mockMvc.perform(get("/api/profiles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
                
        System.out.println("Actual response: " + response);
        
        // This test demonstrates the TDD approach:
        // 1. FAILS when DataInitializer is commented out (returns fewer profiles)
        // 2. PASSES when DataInitializer is active (returns 8 base profiles)
        mockMvc.perform(get("/api/profiles")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8)); // This assertion captures the bug
    }
}