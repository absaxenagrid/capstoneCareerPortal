package com.forge.candidate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "external_candidate")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id")
    private Long candidateId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    // ---- documented profile columns ----
    @Column(name = "total_experience_years")
    private Float totalExperienceYears;

    @Column(name = "total_gap_years")
    private Float totalGapYears;

    @Column(name = "current_ctc")
    private Long currentCtc;

    @Column(name = "expected_ctc")
    private Long expectedCtc;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Column(name = "willing_to_relocate")
    private Boolean willingToRelocate;

    @Column(name = "free_notes", columnDefinition = "TEXT")
    private String freeNotes;

    @Column(name = "source", nullable = false)
    private String source = "PORTAL";

    @Column(name = "email_hash", unique = true)
    private String emailHash;

    @Column(name = "phone_hash", unique = true)
    private String phoneHash;

    // ---- GDPR / PII / soft-delete audit ----
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "delete_reason", columnDefinition = "TEXT")
    private String deleteReason;

    @Column(name = "pii_anonymized", nullable = false)
    private Boolean piiAnonymized = false;

    @Column(name = "pii_anonymized_at")
    private LocalDateTime piiAnonymizedAt;

    @Column(name = "gdpr_delete_requested", nullable = false)
    private Boolean gdprDeleteRequested = false;

    @Column(name = "gdpr_delete_requested_at")
    private LocalDateTime gdprDeleteRequestedAt;

    @Column(name = "gdpr_delete_due_at")
    private LocalDateTime gdprDeleteDueAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EducationDetail> educationDetails = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExperienceDetail> experienceDetails = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CandidateSkill> skills = new ArrayList<>();

    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private CandidatePreference preferences;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SocialLink> socialLinks = new ArrayList<>();
}
