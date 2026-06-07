package com.forge.candidate.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationResponse {
    private Long educationId;
    private String degree;
    private String specialization;
    private String institutionName;
    private Integer startYear;
    private Integer endYear;
    private BigDecimal percentage;
    private LocalDateTime createdAt;
}
