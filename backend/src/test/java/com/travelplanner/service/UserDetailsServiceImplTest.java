package com.travelplanner.service;

import com.travelplanner.entity.User;
import com.travelplanner.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;
    
    private User mockUser;
    
    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setFirstName("Test");
        mockUser.setLastName("User");
        mockUser.setPassword("hashedPassword");
    }
    
    @Test
    void loadUserByUsername_ExistingUser_ReturnsUserDetails() {
        // Given
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        
        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        
        // Then
        assertNotNull(userDetails);
        assertEquals(email, userDetails.getUsername());
        assertEquals("hashedPassword", userDetails.getPassword());
        assertTrue(userDetails.isAccountNonExpired());
        assertTrue(userDetails.isAccountNonLocked());
        assertTrue(userDetails.isCredentialsNonExpired());
        assertTrue(userDetails.isEnabled());
        
        verify(userRepository).findByEmail(email);
    }
    
    @Test
    void loadUserByUsername_NonExistingUser_ThrowsUsernameNotFoundException() {
        // Given
        String nonExistentEmail = "nonexistent@example.com";
        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());
        
        // When & Then
        UsernameNotFoundException exception = assertThrows(
            UsernameNotFoundException.class,
            () -> userDetailsService.loadUserByUsername(nonExistentEmail)
        );
        
        assertEquals("User Not Found with email: " + nonExistentEmail, exception.getMessage());
        verify(userRepository).findByEmail(nonExistentEmail);
    }
    
    @Test
    void loadUserByUsername_ValidEmailFormat_CallsRepositoryWithCorrectEmail() {
        // Given
        String email = "user.name+tag@example.co.uk";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        
        // When
        userDetailsService.loadUserByUsername(email);
        
        // Then
        verify(userRepository).findByEmail(email);
    }
    
    @Test
    void loadUserByUsername_EmailWithSpecialCharacters_HandlesCorrectly() {
        // Given
        String specialEmail = "test+special@domain-name.com";
        mockUser.setEmail(specialEmail);
        when(userRepository.findByEmail(specialEmail)).thenReturn(Optional.of(mockUser));
        
        // When
        UserDetails result = userDetailsService.loadUserByUsername(specialEmail);
        
        // Then
        assertNotNull(result);
        assertEquals(specialEmail, result.getUsername());
        verify(userRepository).findByEmail(specialEmail);
    }
    
    @Test
    void loadUserByUsername_UserWithDifferentFields_ReturnsCorrectUserDetails() {
        // Given
        User anotherUser = new User();
        anotherUser.setId(2L);
        anotherUser.setEmail("another@example.com");
        anotherUser.setFirstName("Another");
        anotherUser.setLastName("Person");
        anotherUser.setPassword("differentPassword");
        
        when(userRepository.findByEmail("another@example.com")).thenReturn(Optional.of(anotherUser));
        
        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("another@example.com");
        
        // Then
        assertNotNull(userDetails);
        assertEquals("another@example.com", userDetails.getUsername());
        assertEquals("differentPassword", userDetails.getPassword());
        verify(userRepository).findByEmail("another@example.com");
    }
}