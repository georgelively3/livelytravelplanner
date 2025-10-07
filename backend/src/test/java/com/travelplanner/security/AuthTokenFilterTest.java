package com.travelplanner.security;

import com.travelplanner.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;
    
    @Mock
    private UserDetailsService userDetailsService;
    
    @Mock
    private HttpServletRequest request;
    
    @Mock
    private HttpServletResponse response;
    
    @Mock
    private FilterChain filterChain;
    
    @Mock
    private SecurityContext securityContext;
    
    @InjectMocks
    private AuthTokenFilter authTokenFilter;
    
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
    void doFilterInternal_ValidJwtToken_SetsAuthentication() throws ServletException, IOException {
        // Given
        String jwt = "valid.jwt.token";
        String email = "test@example.com";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(mockUser);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            authTokenFilter.doFilterInternal(request, response, filterChain);
            
            // Then
            verify(jwtUtils).validateJwtToken(jwt);
            verify(jwtUtils).getUserNameFromJwtToken(jwt);
            verify(userDetailsService).loadUserByUsername(email);
            verify(securityContext).setAuthentication(any(UsernamePasswordAuthenticationToken.class));
            verify(filterChain).doFilter(request, response);
        }
    }
    
    @Test
    void doFilterInternal_NoAuthorizationHeader_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(null);
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils, never()).validateJwtToken(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_EmptyAuthorizationHeader_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("");
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils, never()).validateJwtToken(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_AuthorizationHeaderWithoutBearer_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Basic somebasicauth");
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils, never()).validateJwtToken(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_InvalidJwtToken_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        String jwt = "invalid.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(false);
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils, never()).getUserNameFromJwtToken(any());
        verify(userDetailsService, never()).loadUserByUsername(any());
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_ExceptionDuringProcessing_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        String jwt = "problematic.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenThrow(new RuntimeException("JWT processing error"));
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils).validateJwtToken(jwt);
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_ValidTokenButUserNotFound_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        String jwt = "valid.jwt.token";
        String email = "nonexistent@example.com";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenThrow(new RuntimeException("User not found"));
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils).getUserNameFromJwtToken(jwt);
        verify(userDetailsService).loadUserByUsername(email);
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_BearerTokenWithOnlySpaces_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Bearer    ");
        when(jwtUtils.validateJwtToken("   ")).thenReturn(false);
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils).validateJwtToken("   ");
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_BearerTokenExactlySevenChars_ContinuesFilterChain() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Bearer ");
        when(jwtUtils.validateJwtToken("")).thenReturn(false);
        
        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        // Then
        verify(jwtUtils).validateJwtToken("");
        verify(filterChain).doFilter(request, response);
    }
    
    @Test
    void doFilterInternal_ValidTokenSetsCorrectAuthenticationDetails() throws ServletException, IOException {
        // Given
        String jwt = "valid.jwt.token";
        String email = "test@example.com";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(email);
        when(userDetailsService.loadUserByUsername(email)).thenReturn(mockUser);
        
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            // When
            authTokenFilter.doFilterInternal(request, response, filterChain);
            
            // Then
            verify(securityContext).setAuthentication(argThat(auth -> {
                UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) auth;
                return token.getPrincipal() == mockUser && 
                       token.getCredentials() == null &&
                       token.getAuthorities().equals(mockUser.getAuthorities());
            }));
        }
    }
}