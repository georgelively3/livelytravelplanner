package com.travelplanner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.dto.UserPersonaRequest;
import com.travelplanner.dto.UserPersonaResponse;
import com.travelplanner.entity.TravelerProfile;
import com.travelplanner.entity.User;
import com.travelplanner.entity.UserPersona;
import com.travelplanner.repository.TravelerProfileRepository;
import com.travelplanner.repository.UserPersonaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PersonasControllerTest {

    private MockMvc mockMvc;
    
    @Mock
    private UserPersonaRepository userPersonaRepository;
    
    @Mock
    private TravelerProfileRepository travelerProfileRepository;
    
    @Mock
    private SecurityContext securityContext;
    
    @Mock
    private Authentication authentication;
    
    @InjectMocks
    private PersonasController personasController;
    
    private ObjectMapper objectMapper;
    private User mockUser;
    private TravelerProfile mockProfile;
    private UserPersona mockPersona;
    private UserPersonaRequest mockRequest;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(personasController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        
        // Setup mock user
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setFirstName("Test");
        mockUser.setLastName("User");
        
        // Setup mock profile
        mockProfile = new TravelerProfile();
        mockProfile.setId(1L);
        mockProfile.setName("Adventure Seeker");
        mockProfile.setDescription("Loves outdoor activities");
        
        // Setup mock persona
        mockPersona = new UserPersona();
        mockPersona.setId(1L);
        mockPersona.setUser(mockUser);
        mockPersona.setBaseProfile(mockProfile);
        mockPersona.setPersonalPreferences("{\"activities\": [\"hiking\", \"camping\"]}");
        mockPersona.setConstraints("{\"budget\": \"moderate\"}");
        mockPersona.setBudgetDetails("{\"max\": 5000}");
        mockPersona.setAccessibilityNeeds("{\"mobility\": \"none\"}");
        mockPersona.setGroupDynamics("{\"size\": \"small\"}");
        mockPersona.setCreatedAt(LocalDateTime.now());
        mockPersona.setUpdatedAt(LocalDateTime.now());
        
        // Setup mock request
        mockRequest = new UserPersonaRequest();
        mockRequest.setBaseProfileId(1L);
        mockRequest.setPersonalPreferences("{\"activities\": [\"hiking\"]}");
        mockRequest.setConstraints("{\"budget\": \"low\"}");
        mockRequest.setBudgetDetails("{\"max\": 3000}");
        mockRequest.setAccessibilityNeeds("{\"mobility\": \"none\"}");
        mockRequest.setGroupDynamics("{\"size\": \"solo\"}");
    }
    
    private void mockAuthenticatedUser() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(mockUser);
    }
    
    private void mockUnauthenticatedUser() {
        when(securityContext.getAuthentication()).thenReturn(null);
    }
    
    @Test
    void getUserPersonas_AuthenticatedUser_ReturnsPersonas() throws Exception {
        // Given
        List<UserPersona> personas = Arrays.asList(mockPersona);
        when(userPersonaRepository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(personas);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(get("/api/personas"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.personas").isArray())
                    .andExpect(jsonPath("$.personas.length()").value(1))
                    .andExpect(jsonPath("$.personas[0].id").value(1))
                    .andExpect(jsonPath("$.personas[0].baseProfileName").value("Adventure Seeker"));
        }
        
        verify(userPersonaRepository).findByUserIdOrderByUpdatedAtDesc(1L);
    }
    
    @Test
    void getUserPersonas_UnauthenticatedUser_ReturnsBadRequest() throws Exception {
        // Given
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockUnauthenticatedUser();
            
            // When & Then
            mockMvc.perform(get("/api/personas"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("User not authenticated"));
        }
        
        verify(userPersonaRepository, never()).findByUserIdOrderByUpdatedAtDesc(anyLong());
    }
    
    @Test
    void createPersona_ValidRequest_ReturnsCreatedPersona() throws Exception {
        // Given
        when(travelerProfileRepository.findById(1L)).thenReturn(Optional.of(mockProfile));
        when(userPersonaRepository.save(any(UserPersona.class))).thenReturn(mockPersona);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(post("/api/personas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.message").value("Persona created successfully"))
                    .andExpect(jsonPath("$.persona.id").value(1))
                    .andExpect(jsonPath("$.persona.baseProfileName").value("Adventure Seeker"));
        }
        
        verify(travelerProfileRepository).findById(1L);
        verify(userPersonaRepository).save(any(UserPersona.class));
    }
    
    @Test
    void createPersona_UnauthenticatedUser_ReturnsBadRequest() throws Exception {
        // Given
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockUnauthenticatedUser();
            
            // When & Then
            mockMvc.perform(post("/api/personas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("User not authenticated"));
        }
        
        verify(userPersonaRepository, never()).save(any(UserPersona.class));
    }
    
    @Test
    void createPersona_InvalidBaseProfile_ReturnsBadRequest() throws Exception {
        // Given
        when(travelerProfileRepository.findById(1L)).thenReturn(Optional.empty());
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(post("/api/personas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Base profile not found"));
        }
        
        verify(travelerProfileRepository).findById(1L);
        verify(userPersonaRepository, never()).save(any(UserPersona.class));
    }
    
    @Test
    void getPersona_AuthenticatedUserAndValidId_ReturnsPersona() throws Exception {
        // Given
        when(userPersonaRepository.findByUserIdAndId(1L, 1L)).thenReturn(mockPersona);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(get("/api/personas/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.persona.id").value(1))
                    .andExpect(jsonPath("$.persona.baseProfileName").value("Adventure Seeker"));
        }
        
        verify(userPersonaRepository).findByUserIdAndId(1L, 1L);
    }
    
    @Test
    void getPersona_UnauthenticatedUser_ReturnsBadRequest() throws Exception {
        // Given
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockUnauthenticatedUser();
            
            // When & Then
            mockMvc.perform(get("/api/personas/1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("User not authenticated"));
        }
        
        verify(userPersonaRepository, never()).findByUserIdAndId(anyLong(), anyLong());
    }
    
    @Test
    void getPersona_PersonaNotFound_ReturnsNotFound() throws Exception {
        // Given
        when(userPersonaRepository.findByUserIdAndId(1L, 999L)).thenReturn(null);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(get("/api/personas/999"))
                    .andExpect(status().isNotFound());
        }
        
        verify(userPersonaRepository).findByUserIdAndId(1L, 999L);
    }
    
    @Test
    void updatePersona_ValidRequest_ReturnsUpdatedPersona() throws Exception {
        // Given
        UserPersona existingPersona = new UserPersona();
        existingPersona.setId(1L);
        existingPersona.setUser(mockUser);
        existingPersona.setBaseProfile(mockProfile);
        
        when(userPersonaRepository.findByUserIdAndId(1L, 1L)).thenReturn(existingPersona);
        when(travelerProfileRepository.findById(1L)).thenReturn(Optional.of(mockProfile));
        when(userPersonaRepository.save(any(UserPersona.class))).thenReturn(mockPersona);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(put("/api/personas/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.message").value("Persona updated successfully"))
                    .andExpect(jsonPath("$.persona.id").value(1));
        }
        
        verify(userPersonaRepository).findByUserIdAndId(1L, 1L);
        verify(userPersonaRepository).save(any(UserPersona.class));
    }
    
    @Test
    void updatePersona_UnauthenticatedUser_ReturnsBadRequest() throws Exception {
        // Given
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockUnauthenticatedUser();
            
            // When & Then
            mockMvc.perform(put("/api/personas/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("User not authenticated"));
        }
        
        verify(userPersonaRepository, never()).findByUserIdAndId(anyLong(), anyLong());
    }
    
    @Test
    void updatePersona_PersonaNotFound_ReturnsNotFound() throws Exception {
        // Given
        when(userPersonaRepository.findByUserIdAndId(1L, 999L)).thenReturn(null);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(put("/api/personas/999")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(mockRequest)))
                    .andExpect(status().isNotFound());
        }
        
        verify(userPersonaRepository).findByUserIdAndId(1L, 999L);
        verify(userPersonaRepository, never()).save(any(UserPersona.class));
    }
    
    @Test
    void updatePersona_PartialUpdate_UpdatesOnlyProvidedFields() throws Exception {
        // Given
        UserPersonaRequest partialRequest = new UserPersonaRequest();
        partialRequest.setBaseProfileId(1L); // Required field must be provided
        partialRequest.setPersonalPreferences("{\"updated\": \"preferences\"}");
        // Other optional fields are null - should not be updated
        
        UserPersona existingPersona = new UserPersona();
        existingPersona.setId(1L);
        existingPersona.setUser(mockUser);
        existingPersona.setBaseProfile(mockProfile);
        existingPersona.setConstraints("original constraints");
        
        when(userPersonaRepository.findByUserIdAndId(1L, 1L)).thenReturn(existingPersona);
        when(travelerProfileRepository.findById(1L)).thenReturn(Optional.of(mockProfile));
        when(userPersonaRepository.save(any(UserPersona.class))).thenReturn(mockPersona);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            mockAuthenticatedUser();
            
            // When & Then
            mockMvc.perform(put("/api/personas/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(partialRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Persona updated successfully"));
        }
        
        verify(userPersonaRepository).save(any(UserPersona.class));
    }
}