package com.travelplanner.controller;

import com.travelplanner.model.TravelerProfile;
import com.travelplanner.repository.TravelerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProfilesControllerTest {

    private MockMvc mockMvc;
    
    @Mock
    private TravelerProfileRepository travelerProfileRepository;
    
    @InjectMocks
    private ProfilesController profilesController;
    
    private TravelerProfile mockProfile1;
    private TravelerProfile mockProfile2;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(profilesController).build();
        
        // Setup mock profiles
        mockProfile1 = new TravelerProfile();
        mockProfile1.setId(1L);
        mockProfile1.setName("Adventure Seeker");
        mockProfile1.setDescription("Loves outdoor activities and adventure sports");
        
        mockProfile2 = new TravelerProfile();
        mockProfile2.setId(2L);
        mockProfile2.setName("Cultural Explorer");
        mockProfile2.setDescription("Interested in museums, history, and cultural experiences");
    }
    
    @Test
    void getAllProfiles_ReturnsListOfProfiles() throws Exception {
        // Given
        List<TravelerProfile> profiles = Arrays.asList(mockProfile1, mockProfile2);
        when(travelerProfileRepository.findAll()).thenReturn(profiles);
        
        // When & Then
        mockMvc.perform(get("/api/profiles"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.profiles").isArray())
                .andExpect(jsonPath("$.profiles.length()").value(2))
                .andExpect(jsonPath("$.profiles[0].id").value(1))
                .andExpect(jsonPath("$.profiles[0].name").value("Adventure Seeker"))
                .andExpect(jsonPath("$.profiles[0].description").value("Loves outdoor activities and adventure sports"))
                .andExpect(jsonPath("$.profiles[1].id").value(2))
                .andExpect(jsonPath("$.profiles[1].name").value("Cultural Explorer"))
                .andExpect(jsonPath("$.profiles[1].description").value("Interested in museums, history, and cultural experiences"));
        
        verify(travelerProfileRepository).findAll();
    }
    
    @Test
    void getAllProfiles_EmptyList_ReturnsEmptyArray() throws Exception {
        // Given
        when(travelerProfileRepository.findAll()).thenReturn(Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/api/profiles"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.profiles").isArray())
                .andExpect(jsonPath("$.profiles.length()").value(0));
        
        verify(travelerProfileRepository).findAll();
    }
    
    @Test
    void getProfile_ExistingProfile_ReturnsProfile() throws Exception {
        // Given
        when(travelerProfileRepository.findById(1L)).thenReturn(Optional.of(mockProfile1));
        
        // When & Then
        mockMvc.perform(get("/api/profiles/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.profile.id").value(1))
                .andExpect(jsonPath("$.profile.name").value("Adventure Seeker"))
                .andExpect(jsonPath("$.profile.description").value("Loves outdoor activities and adventure sports"));
        
        verify(travelerProfileRepository).findById(1L);
    }
    
    @Test
    void getProfile_NonExistingProfile_ReturnsNotFound() throws Exception {
        // Given
        when(travelerProfileRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        mockMvc.perform(get("/api/profiles/999"))
                .andExpect(status().isNotFound());
        
        verify(travelerProfileRepository).findById(999L);
    }
    
    @Test
    void getProfile_ValidIdFormat_CallsRepositoryWithCorrectId() throws Exception {
        // Given
        when(travelerProfileRepository.findById(42L)).thenReturn(Optional.of(mockProfile1));
        
        // When & Then
        mockMvc.perform(get("/api/profiles/42"))
                .andExpect(status().isOk());
        
        verify(travelerProfileRepository).findById(42L);
    }
    
    @Test
    void getAllProfiles_SingleProfile_ReturnsCorrectStructure() throws Exception {
        // Given
        List<TravelerProfile> profiles = Arrays.asList(mockProfile1);
        when(travelerProfileRepository.findAll()).thenReturn(profiles);
        
        // When & Then
        mockMvc.perform(get("/api/profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profiles").isArray())
                .andExpect(jsonPath("$.profiles.length()").value(1))
                .andExpect(jsonPath("$.profiles[0]").exists())
                .andExpect(jsonPath("$.profiles[0].id").exists())
                .andExpect(jsonPath("$.profiles[0].name").exists())
                .andExpect(jsonPath("$.profiles[0].description").exists());
        
        verify(travelerProfileRepository).findAll();
    }
}