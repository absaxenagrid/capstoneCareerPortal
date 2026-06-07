package com.forge.notification.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
    private Long          notificationId;
    private String        candidateEmail;
    private String        title;
    private String        message;
    private String        type;
    private String        referenceId;
    private Boolean       isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
