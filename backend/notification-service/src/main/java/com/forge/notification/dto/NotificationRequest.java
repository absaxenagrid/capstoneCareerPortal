package com.forge.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationRequest {

    @NotBlank @Email
    private String candidateEmail;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private String type = "APPLICATION";
    private String referenceId;
}
