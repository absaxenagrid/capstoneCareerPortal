package com.forge.candidate.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PreferenceResponse {
    private Long preferenceId;
    private String workMode;
    private Long desiredSalaryMin;
    private Long desiredSalaryMax;
    private List<String> preferredLocations;
    private Integer noticePeriodDays;
    private Boolean willingToRelocate;
}
