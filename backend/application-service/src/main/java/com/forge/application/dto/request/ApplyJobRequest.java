package com.forge.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request payload for submitting a job application.
 * No authentication required — identified by candidate email + job ID.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplyJobRequest {

    @NotBlank(message = "candidateEmail is required")
    @Email(message = "candidateEmail must be a valid email address")
    private String candidateEmail;

    /** Optional link to candidate-service profile (can be null if no profile exists yet) */
    private Long candidateId;

    @NotNull(message = "jobId is required")
    private Long jobId;

    /** Snapshot of job title at submission time */
    private String jobTitle;

    private String resumeFilePath;
    private String resumeOriginalFilename;

    /** Full candidate profile snapshot captured at submission */
    private SnapshotRequest snapshot;

    private String source = "CAREERS_PORTAL";
    private String freeNotes;

    // ── Inner DTO ─────────────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SnapshotRequest {
        private String  candidateName;
        private String  email;
        private String  phoneNumber;
        private String  location;
        private Double  totalExperienceYears;
        private Long    currentCtc;
        private Long    expectedCtc;
        private Integer noticePeriodDays;
        private Boolean legallyAuthorized;
        private Boolean willingToRelocate;
        private String  additionalComments;
        // JSON blobs
        private Object educationJson;
        private Object experienceJson;
        private Object socialLinksJson;
        private Object skillsJson;
    }
}
