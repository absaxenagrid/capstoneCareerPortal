package com.forge.application.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationResponse {
    private Long applicationId;
    private String candidateEmail;
    private Long candidateId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String source;
    private String currentStage;
    private Integer aiScore;
    private String aiRationale;
    private String resumeOriginalFilename;
    private LocalDateTime appliedAt;
    private LocalDateTime lastUpdatedAt;
    private Boolean blockedFromReapply;
    private SnapshotSummaryResponse snapshot;
}
