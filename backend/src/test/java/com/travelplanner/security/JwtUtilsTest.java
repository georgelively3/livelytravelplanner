package com.travelplanner.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class JwtUtilsTest {

    @Autowired
    private JwtUtils jwtUtils;

    private String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        // Setup is handled by Spring Boot test configuration
    }

    @Test
    void testGenerateTokenFromUsername() {
        String token = jwtUtils.generateTokenFromUsername(testEmail);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.contains("."));
    }

    @Test
    void testGetUserNameFromJwtToken() {
        String token = jwtUtils.generateTokenFromUsername(testEmail);
        String extractedEmail = jwtUtils.getUserNameFromJwtToken(token);
        
        assertEquals(testEmail, extractedEmail);
    }

    @Test
    void testValidateJwtToken() {
        String validToken = jwtUtils.generateTokenFromUsername(testEmail);
        
        assertTrue(jwtUtils.validateJwtToken(validToken));
    }

    @Test
    void testValidateInvalidJwtToken() {
        String invalidToken = "invalid.jwt.token";
        
        assertFalse(jwtUtils.validateJwtToken(invalidToken));
    }

    @Test
    void testValidateNullJwtToken() {
        assertFalse(jwtUtils.validateJwtToken(null));
    }

    @Test
    void testValidateEmptyJwtToken() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }

    @Test
    void testGenerateTokenForDifferentEmails() {
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";
        
        String token1 = jwtUtils.generateTokenFromUsername(email1);
        String token2 = jwtUtils.generateTokenFromUsername(email2);
        
        assertNotEquals(token1, token2);
        assertEquals(email1, jwtUtils.getUserNameFromJwtToken(token1));
        assertEquals(email2, jwtUtils.getUserNameFromJwtToken(token2));
    }

    @Test
    void testGetExpirationDateFromJwtToken() {
        String token = jwtUtils.generateTokenFromUsername(testEmail);
        
        assertNotNull(jwtUtils.getExpirationDateFromJwtToken(token));
        assertTrue(jwtUtils.getExpirationDateFromJwtToken(token).after(new java.util.Date()));
    }

    @Test
    void testTokenStructure() {
        String token = jwtUtils.generateTokenFromUsername(testEmail);
        
        // JWT tokens have 3 parts separated by dots
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);
        
        // Each part should not be empty
        for (String part : parts) {
            assertFalse(part.isEmpty());
        }
    }
}