package com.forge.application.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_profile_snapshots")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Slf4j
public class ApplicationProfileSnapshot {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "snapshot_id")
    private Long snapshotId;

    @OneToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "candidate_name",  length = 200)
    private String candidateName;

    @Column(name = "email",           length = 150)
    private String email;

    @Column(name = "phone_number",    length = 20)
    private String phoneNumber;

    @Column(name = "location",        length = 300)
    private String location;

    @Column(name = "total_experience_years")
    private Double totalExperienceYears;

    @Column(name = "current_ctc")
    private Long currentCtc;

    @Column(name = "expected_ctc")
    private Long expectedCtc;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Column(name = "work_mode",        length = 30)
    private String workMode;

    @Column(name = "legally_authorized")
    private Boolean legallyAuthorized;

    @Column(name = "willing_to_relocate")
    private Boolean willingToRelocate;

    @Column(name = "additional_comments", columnDefinition = "TEXT")
    private String additionalComments;

    // JSON stored as plain TEXT — no JSONB type conversion needed
    @Column(name = "preferred_locations",  columnDefinition = "TEXT")
    private String preferredLocations;

    @Column(name = "education_json",       columnDefinition = "TEXT")
    private String educationJson;

    @Column(name = "experience_json",      columnDefinition = "TEXT")
    private String experienceJson;

    @Column(name = "skills_json",          columnDefinition = "TEXT")
    private String skillsJson;

    @Column(name = "certifications_json",  columnDefinition = "TEXT")
    private String certificationsJson;

    @Column(name = "social_links_json",    columnDefinition = "TEXT")
    private String socialLinksJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }

    // Serialize any Object to a JSON string before storing
    public void setEducationJsonObj(Object obj)   { this.educationJson   = toJson(obj); }
    public void setExperienceJsonObj(Object obj)  { this.experienceJson  = toJson(obj); }
    public void setSocialLinksJsonObj(Object obj) { this.socialLinksJson = toJson(obj); }
    public void setSkillsJsonObj(Object obj)      { this.skillsJson      = toJson(obj); }

    private static String toJson(Object obj) {
        if (obj == null) return null;
        if (obj instanceof String s) return s.isBlank() ? null : s;
        try { return MAPPER.writeValueAsString(obj); }
        catch (JsonProcessingException e) {
            log.warn("JSON serialization failed: {}", e.getMessage());
            return null;
        }
    }
}
