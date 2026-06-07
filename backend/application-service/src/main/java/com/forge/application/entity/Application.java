package com.forge.application.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "applications",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_candidate_email_job",
        columnNames = {"candidate_email", "job_id"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    /** Email-based identity — no auth required */
    @Column(name = "candidate_email", nullable = false, length = 150)
    private String candidateEmail;

    /** Optional link to candidate-service record */
    @Column(name = "candidate_id")
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    /** Snapshot of job title at submission time */
    @Column(name = "job_title", length = 300)
    private String jobTitle;

    @Column(name = "source")
    private String source = "CAREERS_PORTAL";

    @Column(name = "resume_file_path")
    private String resumeFilePath;

    @Column(name = "resume_original_filename")
    private String resumeOriginalFilename;

    @Column(name = "ai_rationale", columnDefinition = "TEXT")
    private String aiRationale;

    @Column(name = "free_notes", columnDefinition = "TEXT")
    private String freeNotes;

    @Column(name = "current_stage")
    private String currentStage = "APPLIED";

    @Column(name = "ai_score")
    private Integer aiScore;

    @Column(name = "stage_move_reason")
    private String stageMoveReason;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @Column(name = "blocked_from_reapply")
    private Boolean blockedFromReapply = false;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private ApplicationProfileSnapshot snapshot;

    @PrePersist
    void prePersist() {
        this.appliedAt    = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }
}
