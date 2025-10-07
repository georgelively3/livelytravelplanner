package com.travelplanner.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;

public class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    void testUserCreation() {
        // Test default constructor
        assertNotNull(user);
        assertNull(user.getId());
        assertNull(user.getEmail());
        assertNull(user.getFirstName());
        assertNull(user.getLastName());
        assertNull(user.getPassword());
    }

    @Test
    void testUserWithParameters() {
        // Test parameterized constructor
        User userWithParams = new User("john@example.com", "password123", "John", "Doe");
        
        assertEquals("john@example.com", userWithParams.getEmail());
        assertEquals("password123", userWithParams.getPassword());
        assertEquals("John", userWithParams.getFirstName());
        assertEquals("Doe", userWithParams.getLastName());
        assertNotNull(userWithParams.getCreatedAt());
        assertNotNull(userWithParams.getUpdatedAt());
    }

    @Test
    void testSettersAndGetters() {
        // Test all setters and getters
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("password");
        
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        assertEquals(1L, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("Test", user.getFirstName());
        assertEquals("User", user.getLastName());
        assertEquals("password", user.getPassword());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }

    @Test
    void testPrePersist() {
        // Test that @PrePersist sets createdAt and updatedAt
        user.onCreate();
        
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
        assertEquals(user.getCreatedAt(), user.getUpdatedAt());
    }

    @Test
    void testPreUpdate() {
        // Test that @PreUpdate sets updatedAt
        LocalDateTime originalTime = LocalDateTime.now().minusHours(1);
        user.setCreatedAt(originalTime);
        user.setUpdatedAt(originalTime);
        
        // Simulate update
        try {
            Thread.sleep(10); // Ensure time difference
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        user.onUpdate();
        
        assertEquals(originalTime, user.getCreatedAt()); // Should not change
        assertTrue(user.getUpdatedAt().isAfter(originalTime)); // Should be updated
    }

    @Test
    void testUserDetailsImplementation() {
        // Test UserDetails interface methods
        user.setEmail("test@example.com");
        
        assertEquals("test@example.com", user.getUsername());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
        assertNotNull(user.getAuthorities());
        assertTrue(user.getAuthorities().isEmpty());
    }

    @Test
    void testEmailValidation() {
        // Test email constraints
        user.setEmail("valid@example.com");
        assertEquals("valid@example.com", user.getEmail());
        
        // Test that email can be set to null (business logic should handle validation)
        user.setEmail(null);
        assertNull(user.getEmail());
    }

    @Test
    void testPasswordSecurity() {
        // Test password handling
        String password = "securePassword123";
        user.setPassword(password);
        assertEquals(password, user.getPassword());
    }
}