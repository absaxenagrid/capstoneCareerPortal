package com.forge.application.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SnapshotSummaryResponse {
    private String  candidateName;
    private String  email;
    private String  phoneNumber;
    private String  location;
    private Double  totalExperienceYears;
    private Long    currentCtc;
    private Long    expectedCtc;
    private Integer noticePeriodDays;
    private String  workMode;
    private Boolean legallyAuthorized;
    private Boolean willingToRelocate;
    private List<String> preferredLocations;
    private Object  skills;
}
