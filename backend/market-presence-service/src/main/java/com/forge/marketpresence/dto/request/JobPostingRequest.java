package com.forge.marketpresence.dto.request;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPostingRequest {
    private Long demandId;
    private String roleTitle;
    private String slug;
    private String description;
    private String skillsRequired;
    private String responsibilities;
    private String benefits;
    private String employmentType;
    private String experienceLevel;
    private String experienceYears;
    private String workMode;
    private String locationCity;
    private String locationState;
    private String locationCountry;
    private String department;
    private String jobCategory;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private Boolean showSalary;
    private String metaTitle;
    private String metaDescription;
    private Long createdBy;
}
