package com.travelplanner.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtResponseTest {

    @Test
    void createJwtResponse_WithConstructor() {
        // Given
        String token = "jwt.token.here";
        Long id = 1L;
        String email = "test@example.com";
        String firstName = "John";
        String lastName = "Doe";
        
        // When
        JwtResponse jwtResponse = new JwtResponse(token, id, email, firstName, lastName);
        
        // Then
        assertEquals(token, jwtResponse.getAccessToken());
        assertEquals("Bearer", jwtResponse.getTokenType());
        assertEquals(id, jwtResponse.getId());
        assertEquals(email, jwtResponse.getEmail());
        assertEquals(firstName, jwtResponse.getFirstName());
        assertEquals(lastName, jwtResponse.getLastName());
    }
    
    @Test
    void setAndGetAccessToken_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("initial", 1L, "test@example.com", "John", "Doe");
        String newToken = "new.jwt.token";
        
        // When
        jwtResponse.setAccessToken(newToken);
        
        // Then
        assertEquals(newToken, jwtResponse.getAccessToken());
    }
    
    @Test
    void setAndGetTokenType_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        String newType = "Custom";
        
        // When
        jwtResponse.setTokenType(newType);
        
        // Then
        assertEquals(newType, jwtResponse.getTokenType());
    }
    
    @Test
    void setAndGetId_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        Long newId = 999L;
        
        // When
        jwtResponse.setId(newId);
        
        // Then
        assertEquals(newId, jwtResponse.getId());
    }
    
    @Test
    void setAndGetEmail_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        String newEmail = "newemail@example.com";
        
        // When
        jwtResponse.setEmail(newEmail);
        
        // Then
        assertEquals(newEmail, jwtResponse.getEmail());
    }
    
    @Test
    void setAndGetFirstName_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        String newFirstName = "Jane";
        
        // When
        jwtResponse.setFirstName(newFirstName);
        
        // Then
        assertEquals(newFirstName, jwtResponse.getFirstName());
    }
    
    @Test
    void setAndGetLastName_SetsAndReturnsCorrectValue() {
        // Given
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        String newLastName = "Smith";
        
        // When
        jwtResponse.setLastName(newLastName);
        
        // Then
        assertEquals(newLastName, jwtResponse.getLastName());
    }
    
    @Test
    void jwtResponse_DefaultTokenTypeIsBarer() {
        // When
        JwtResponse jwtResponse = new JwtResponse("token", 1L, "test@example.com", "John", "Doe");
        
        // Then
        assertEquals("Bearer", jwtResponse.getTokenType());
    }
}