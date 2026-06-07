package com.forge.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailRequest {

    @NotBlank @Email
    private String toEmail;

    @NotBlank
    private String candidateName;

    @NotBlank
    private String jobTitle;

    private String applicationId;
    private String submittedAt;
}
