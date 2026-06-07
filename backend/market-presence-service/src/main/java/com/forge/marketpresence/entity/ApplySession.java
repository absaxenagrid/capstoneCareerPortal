package com.forge.marketpresence.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.OffsetDateTime;

@Entity
@Table(name = "apply_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplySession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "session_token", unique = true) private String sessionToken;
    @Column(name = "candidate_email") private String candidateEmail;
    @Column(name = "candidate_phone") private String candidatePhone;
    @Type(JsonType.class)
    @Column(name = "form_data", columnDefinition = "jsonb") private String formData;
    @Column(name = "current_step")     private Integer currentStep;
    @Column(name = "resume_s3_key")    private String resumeS3Key;
    @Column(name = "resume_file_name") private String resumeFileName;
    @Column(name = "resume_size_bytes") private Long resumeSizeBytes;
    @Column(name = "consent_accepted") private Boolean consentAccepted = false;
    @Column(name = "consent_accepted_at") private OffsetDateTime consentAcceptedAt;
    @Column(name = "session_status")   private String sessionStatus;
    @Column(name = "ip_address", columnDefinition = "inet") private String ipAddress;
    @Column(name = "user_agent", columnDefinition = "TEXT") private String userAgent;
    @Column(name = "started_at")       private OffsetDateTime startedAt;
    @Column(name = "submitted_at")     private OffsetDateTime submittedAt;
    @Column(name = "expires_at")       private OffsetDateTime expiresAt;
    @Column(name = "created_at")       private OffsetDateTime createdAt;
    @Column(name = "updated_at")       private OffsetDateTime updatedAt;
}
