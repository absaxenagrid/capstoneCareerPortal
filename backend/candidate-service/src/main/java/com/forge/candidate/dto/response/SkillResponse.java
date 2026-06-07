package com.forge.candidate.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SkillResponse {
    private Long skillId;
    private String skillName;
    private LocalDateTime createdAt;
}
