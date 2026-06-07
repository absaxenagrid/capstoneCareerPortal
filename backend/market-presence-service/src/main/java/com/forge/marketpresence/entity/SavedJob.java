package com.forge.marketpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "saved_jobs",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_posting_id", "candidate_email"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SavedJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "candidate_email", nullable = false) private String candidateEmail;
    @Column(name = "save_token")           private String saveToken;
    @Column(name = "notification_enabled") private Boolean notificationEnabled = true;
    @Column(name = "saved_at")             private OffsetDateTime savedAt;
}
