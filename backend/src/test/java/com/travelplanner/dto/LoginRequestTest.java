package com.travelplanner.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRequestTest {

    @Test
    void createLoginRequest_DefaultConstructor() {
        // When
        LoginRequest loginRequest = new LoginRequest();
        
        // Then
        assertNull(loginRequest.getEmail());
        assertNull(loginRequest.getPassword());
    }
    
    @Test
    void setAndGetEmail_SetsAndReturnsCorrectValue() {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        String email = "test@example.com";
        
        // When
        loginRequest.setEmail(email);
        
        // Then
        assertEquals(email, loginRequest.getEmail());
    }
    
    @Test
    void setAndGetPassword_SetsAndReturnsCorrectValue() {
        // Given
        LoginRequest loginRequest = new LoginRequest();
        String password = "secretPassword";
        
        // When
        loginRequest.setPassword(password);
        
        // Then
        assertEquals(password, loginRequest.getPassword());
    }
    
    @Test
    void createLoginRequest_WithValidData() {
        // Given
        String email = "user@example.com";
        String password = "myPassword123";
        
        // When
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
        
        // Then
        assertEquals(email, loginRequest.getEmail());
        assertEquals(password, loginRequest.getPassword());
    }
}