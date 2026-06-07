package com.forge.candidate.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationRequest {

    @NotBlank(message = "Degree is required")
    private String degree;

    private String specialization;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    @Min(1900) @Max(2100)
    private Integer startYear;

    @Min(1900) @Max(2100)
    private Integer endYear;

    @DecimalMin("0.0") @DecimalMax("100.0")
    private BigDecimal percentage;
}
