package com.forge.marketpresence.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.OffsetDateTime;

@Entity
@Table(name = "job_posting_versions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPostingVersion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "version_number", nullable = false)  private Integer versionNumber;
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")                 private String snapshot;
    @Column(name = "change_summary", columnDefinition = "TEXT") private String changeSummary;
    @Column(name = "changed_by")                        private Long changedBy;
    @Column(name = "changed_at")                        private OffsetDateTime changedAt;
}
