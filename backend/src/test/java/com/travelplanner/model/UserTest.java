package com.travelplanner.model;

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
    void testDefaultConstructor() {
        assertNotNull(user);
        assertNull(user.getId());
        assertNull(user.getEmail());
        assertNull(user.getPassword());
        assertNull(user.getFirstName());
        assertNull(user.getLastName());
        assertNull(user.getCreatedAt());
        assertNull(user.getUpdatedAt());
        assertNull(user.getPersonas());
    }

    @Test
    void testParameterizedConstructor() {
        String email = "test@example.com";
        String password = "password123";
        String firstName = "Test";
        String lastName = "User";
        
        User testUser = new User(email, password, firstName, lastName);
        
        assertNotNull(testUser);
        assertEquals(email, testUser.getEmail());
        assertEquals(password, testUser.getPassword());
        assertEquals(firstName, testUser.getFirstName());
        assertEquals(lastName, testUser.getLastName());
        assertNotNull(testUser.getCreatedAt());
        assertNotNull(testUser.getUpdatedAt());
    }

    @Test
    void testSettersAndGetters() {
        Long id = 1L;
        String email = "setter@example.com";
        String password = "newpassword";
        String firstName = "Setter";
        String lastName = "Test";
        LocalDateTime now = LocalDateTime.now();
        
        user.setId(id);
        user.setEmail(email);
        user.setPassword(password);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        
        assertEquals(id, user.getId());
        assertEquals(email, user.getEmail());
        assertEquals(password, user.getPassword());
        assertEquals(firstName, user.getFirstName());
        assertEquals(lastName, user.getLastName());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }

    @Test
    void testUserDetailsImplementation() {
        user.setEmail("userdetails@example.com");
        
        // Test UserDetails methods
        assertEquals(user.getEmail(), user.getUsername());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
        assertNotNull(user.getAuthorities());
        assertTrue(user.getAuthorities().isEmpty());
    }

    @Test
    void testEquality() {
        User user1 = new User("test@example.com", "password", "Test", "User");
        User user2 = new User("test2@example.com", "password", "Test", "User"); // Different email
        User user3 = new User("different@example.com", "password", "Test", "User");
        
        // Note: Lombok generates equals/hashCode based on all fields
        assertNotEquals(user1, user2); // Different emails
        assertNotEquals(user1, user3);
        assertEquals(user1, user1); // Same object
    }

    @Test
    void testToString() {
        user.setEmail("toString@example.com");
        user.setFirstName("ToString");
        user.setLastName("Test");
        
        String toString = user.toString();
        assertNotNull(toString);
        assertTrue(toString.contains("toString@example.com"));
        assertTrue(toString.contains("ToString"));
        assertTrue(toString.contains("Test"));
    }

    @Test
    void testAllArgsConstructor() {
        Long id = 1L;
        String email = "allargs@example.com";
        String password = "password123";
        String firstName = "AllArgs";
        String lastName = "Test";
        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
        LocalDateTime updatedAt = LocalDateTime.now();
        
        User allArgsUser = new User(id, email, password, firstName, lastName, createdAt, updatedAt, null);
        
        assertEquals(id, allArgsUser.getId());
        assertEquals(email, allArgsUser.getEmail());
        assertEquals(password, allArgsUser.getPassword());
        assertEquals(firstName, allArgsUser.getFirstName());
        assertEquals(lastName, allArgsUser.getLastName());
        assertEquals(createdAt, allArgsUser.getCreatedAt());
        assertEquals(updatedAt, allArgsUser.getUpdatedAt());
        assertNull(allArgsUser.getPersonas());
    }
}