package com.forge.candidate.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateResponse {
    private Long candidateId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private Boolean profileComplete;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<EducationResponse> educationDetails;
    private List<ExperienceResponse> experienceDetails;
    private List<SkillResponse> skills;
    private PreferenceResponse preferences;
    private SocialLinkResponse socialLinks;
    private ResumeResponse activeResume;
}
