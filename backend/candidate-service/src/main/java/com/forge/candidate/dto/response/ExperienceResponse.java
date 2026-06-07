package com.forge.candidate.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExperienceResponse {
    private Long experienceId;
    private String companyName;
    private String designation;
    private String employmentType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentlyWorking;
    private String responsibilities;
    private LocalDateTime createdAt;
}
