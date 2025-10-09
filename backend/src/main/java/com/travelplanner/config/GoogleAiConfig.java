package com.travelplanner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GoogleAiConfig {

    @Value("${google.ai.api.key:}")
    private String apiKey;
    
    @Value("${google.ai.api.url:https://generativelanguage.googleapis.com}")
    private String apiUrl;
    
    @Bean
    @Profile("!test")
    public WebClient googleAiWebClient() {
        return WebClient.builder()
            .baseUrl(apiUrl)
            .defaultHeader("x-goog-api-key", apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
    
    @Bean
    @Profile("test")
    public WebClient googleAiWebClientTest() {
        // For tests, we'll use a mock or stub implementation
        return WebClient.builder()
            .baseUrl("http://localhost:8080")
            .build();
    }
    
    public String getApiKey() {
        return apiKey;
    }
    
    public String getApiUrl() {
        return apiUrl;
    }
    
    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("your-api-key-here");
    }
}