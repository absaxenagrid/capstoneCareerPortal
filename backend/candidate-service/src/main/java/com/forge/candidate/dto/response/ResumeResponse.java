package com.forge.candidate.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResumeResponse {
    private Long resumeId;
    private String objectKey;
    private String originalFilename;
    private Boolean isActive;
    private Integer version;
    private LocalDateTime uploadedAt;
}
