package com.forge.marketpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "job_posting_channels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPostingChannel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "channel_name")        private String channelName;
    @Column(name = "external_posting_id") private String externalPostingId;
    @Column(name = "external_url", columnDefinition = "TEXT") private String externalUrl;
    @Column(name = "sync_status")         private String syncStatus;
    @Column(name = "published_at")        private OffsetDateTime publishedAt;
    @Column(name = "last_synced_at")      private OffsetDateTime lastSyncedAt;
    @Column(name = "error_message", columnDefinition = "TEXT") private String errorMessage;
    @Column(name = "created_at")          private OffsetDateTime createdAt;
}
