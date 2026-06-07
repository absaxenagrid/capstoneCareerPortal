package com.forge.marketpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "job_posting_analytics",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_posting_id", "analytics_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPostingAnalytics {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "analytics_date", nullable = false) private LocalDate analyticsDate;
    @Column(name = "total_views")            private Integer totalViews = 0;
    @Column(name = "unique_views")           private Integer uniqueViews = 0;
    @Column(name = "apply_clicks")           private Integer applyClicks = 0;
    @Column(name = "applications_started")   private Integer applicationsStarted = 0;
    @Column(name = "applications_submitted") private Integer applicationsSubmitted = 0;
    @Column(name = "saved_count")            private Integer savedCount = 0;
    @Column(name = "share_count")            private Integer shareCount = 0;
    @Column(name = "top_referrer")           private String topReferrer;
    @Column(name = "top_country")            private String topCountry;
    @Column(name = "created_at")             private OffsetDateTime createdAt;
}
