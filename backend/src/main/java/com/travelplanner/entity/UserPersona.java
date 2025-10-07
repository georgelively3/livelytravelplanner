package com.travelplanner.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_personas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"user", "baseProfile"})
public class UserPersona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "base_profile_id")
    private TravelerProfile baseProfile;

    @Column(name = "personal_preferences", columnDefinition = "TEXT")
    private String personalPreferences; // JSON string

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints; // JSON string

    @Column(name = "budget_details", columnDefinition = "TEXT")
    private String budgetDetails; // JSON string

    @Column(name = "accessibility_needs", columnDefinition = "TEXT")
    private String accessibilityNeeds; // JSON string

    @Column(name = "group_dynamics", columnDefinition = "TEXT")
    private String groupDynamics; // JSON string

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserPersona(User user, TravelerProfile baseProfile, String personalPreferences,
                      String constraints, String budgetDetails, String accessibilityNeeds,
                      String groupDynamics) {
        this.user = user;
        this.baseProfile = baseProfile;
        this.personalPreferences = personalPreferences;
        this.constraints = constraints;
        this.budgetDetails = budgetDetails;
        this.accessibilityNeeds = accessibilityNeeds;
        this.groupDynamics = groupDynamics;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}