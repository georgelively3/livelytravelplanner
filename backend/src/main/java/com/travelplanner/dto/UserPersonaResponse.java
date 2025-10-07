package com.travelplanner.dto;

import com.travelplanner.model.UserPersona;

import java.time.LocalDateTime;

public class UserPersonaResponse {
    private Long id;
    private Long baseProfileId;
    private String baseProfileName;
    private String baseProfileDescription;
    private String personalPreferences;
    private String constraints;
    private String budgetDetails;
    private String accessibilityNeeds;
    private String groupDynamics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserPersonaResponse(UserPersona persona) {
        this.id = persona.getId();
        this.baseProfileId = persona.getBaseProfile() != null ? persona.getBaseProfile().getId() : null;
        this.baseProfileName = persona.getBaseProfile() != null ? persona.getBaseProfile().getName() : null;
        this.baseProfileDescription = persona.getBaseProfile() != null ? persona.getBaseProfile().getDescription() : null;
        this.personalPreferences = persona.getPersonalPreferences();
        this.constraints = persona.getConstraints();
        this.budgetDetails = persona.getBudgetDetails();
        this.accessibilityNeeds = persona.getAccessibilityNeeds();
        this.groupDynamics = persona.getGroupDynamics();
        this.createdAt = persona.getCreatedAt();
        this.updatedAt = persona.getUpdatedAt();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBaseProfileId() {
        return baseProfileId;
    }

    public void setBaseProfileId(Long baseProfileId) {
        this.baseProfileId = baseProfileId;
    }

    public String getBaseProfileName() {
        return baseProfileName;
    }

    public void setBaseProfileName(String baseProfileName) {
        this.baseProfileName = baseProfileName;
    }

    public String getBaseProfileDescription() {
        return baseProfileDescription;
    }

    public void setBaseProfileDescription(String baseProfileDescription) {
        this.baseProfileDescription = baseProfileDescription;
    }

    public String getPersonalPreferences() {
        return personalPreferences;
    }

    public void setPersonalPreferences(String personalPreferences) {
        this.personalPreferences = personalPreferences;
    }

    public String getConstraints() {
        return constraints;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }

    public String getBudgetDetails() {
        return budgetDetails;
    }

    public void setBudgetDetails(String budgetDetails) {
        this.budgetDetails = budgetDetails;
    }

    public String getAccessibilityNeeds() {
        return accessibilityNeeds;
    }

    public void setAccessibilityNeeds(String accessibilityNeeds) {
        this.accessibilityNeeds = accessibilityNeeds;
    }

    public String getGroupDynamics() {
        return groupDynamics;
    }

    public void setGroupDynamics(String groupDynamics) {
        this.groupDynamics = groupDynamics;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}