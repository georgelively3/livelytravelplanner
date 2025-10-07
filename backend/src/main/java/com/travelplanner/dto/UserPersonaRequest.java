package com.travelplanner.dto;

import jakarta.validation.constraints.NotNull;

public class UserPersonaRequest {
    @NotNull
    private Long baseProfileId;
    
    private String personalPreferences; // JSON string
    private String constraints; // JSON string  
    private String budgetDetails; // JSON string
    private String accessibilityNeeds; // JSON string
    private String groupDynamics; // JSON string

    public Long getBaseProfileId() {
        return baseProfileId;
    }

    public void setBaseProfileId(Long baseProfileId) {
        this.baseProfileId = baseProfileId;
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
}