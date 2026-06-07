package com.forge.application.service;

import com.forge.application.dto.request.ApplyJobRequest;
import com.forge.application.dto.response.ApplicationResponse;
import com.forge.application.dto.response.SnapshotSummaryResponse;
import com.forge.application.entity.Application;
import com.forge.application.entity.ApplicationProfileSnapshot;
import com.forge.application.exception.AlreadyAppliedException;
import com.forge.application.exception.ResourceNotFoundException;
import com.forge.application.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final RestTemplate           restTemplate;

    @Value("${notification.service.url:http://notification-service:8087}")
    private String notificationServiceUrl;

    public ApplicationResponse applyForJob(ApplyJobRequest request) {

        // 1. Duplicate check — email + jobId must be unique
        if (applicationRepository.existsByCandidateEmailAndJobId(
                request.getCandidateEmail(), request.getJobId())) {
            throw new AlreadyAppliedException("You have already applied for this job.");
        }

        // 2. Build Application entity
        Application application = Application.builder()
                .candidateEmail(request.getCandidateEmail())
                .candidateId(request.getCandidateId())
                .jobId(request.getJobId())
                .jobTitle(request.getJobTitle())
                .source(request.getSource() != null ? request.getSource() : "CAREERS_PORTAL")
                .resumeFilePath(request.getResumeFilePath())
                .resumeOriginalFilename(request.getResumeOriginalFilename())
                .freeNotes(request.getFreeNotes())
                .currentStage("APPLIED")
                .blockedFromReapply(false)
                .build();

        // 3. Build profile snapshot
        String candidateName = null;
        if (request.getSnapshot() != null) {
            ApplyJobRequest.SnapshotRequest snap = request.getSnapshot();
            candidateName = snap.getCandidateName();

            ApplicationProfileSnapshot snapshot = new ApplicationProfileSnapshot();
            snapshot.setApplication(application);
            snapshot.setCandidateName(snap.getCandidateName());
            snapshot.setEmail(snap.getEmail() != null ? snap.getEmail() : request.getCandidateEmail());
            snapshot.setPhoneNumber(snap.getPhoneNumber());
            snapshot.setLocation(snap.getLocation());
            snapshot.setTotalExperienceYears(snap.getTotalExperienceYears());
            snapshot.setCurrentCtc(snap.getCurrentCtc());
            snapshot.setExpectedCtc(snap.getExpectedCtc());
            snapshot.setNoticePeriodDays(snap.getNoticePeriodDays());
            snapshot.setLegallyAuthorized(snap.getLegallyAuthorized());
            snapshot.setWillingToRelocate(snap.getWillingToRelocate());
            snapshot.setAdditionalComments(snap.getAdditionalComments());

            snapshot.setEducationJsonObj(snap.getEducationJson());
            snapshot.setExperienceJsonObj(snap.getExperienceJson());
            snapshot.setSocialLinksJsonObj(snap.getSocialLinksJson());
            snapshot.setSkillsJsonObj(snap.getSkillsJson());

            application.setSnapshot(snapshot);
        }

        Application saved = applicationRepository.save(application);
        log.info("Application saved: id={}, email={}, jobId={}",
                saved.getApplicationId(), saved.getCandidateEmail(), saved.getJobId());

        // 4. Fire-and-forget: call notification service to send email + in-app notification
        sendConfirmationAsync(saved, candidateName);

        return toResponse(saved);
    }

    // ── Trigger notification (non-blocking, failures don't affect submission) ──

    private void sendConfirmationAsync(Application saved, String candidateName) {
        try {
            String submittedAt = saved.getAppliedAt() != null
                    ? saved.getAppliedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a 'UTC'"))
                    : "Just now";

            Map<String, Object> payload = new HashMap<>();
            payload.put("toEmail",       saved.getCandidateEmail());
            payload.put("candidateName", candidateName != null ? candidateName : saved.getCandidateEmail());
            payload.put("jobTitle",      saved.getJobTitle() != null ? saved.getJobTitle() : "the position");
            payload.put("applicationId", String.valueOf(saved.getApplicationId()));
            payload.put("submittedAt",   submittedAt);

            String url = notificationServiceUrl + "/api/notifications/send-confirmation";
            ResponseEntity<Object> response = restTemplate.postForEntity(url, payload, Object.class);
            log.info("Notification service responded: status={} for applicationId={}",
                    response.getStatusCode(), saved.getApplicationId());
        } catch (Exception e) {
            // Never fail the application submission if notification fails
            log.error("Failed to trigger notification for applicationId={}: {}",
                    saved.getApplicationId(), e.getMessage());
        }
    }

    // ── Query methods ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getCandidateApplicationsByEmail(
            String candidateEmail, Pageable pageable) {
        return applicationRepository
                .findByCandidateEmailOrderByAppliedAtDesc(candidateEmail, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long applicationId) {
        return toResponse(findOrThrow(applicationId));
    }

    public ApplicationResponse withdrawApplication(Long applicationId) {
        Application app = findOrThrow(applicationId);
        if ("WITHDRAWN".equals(app.getCurrentStage()))
            throw new IllegalStateException("Application already withdrawn");
        app.setCurrentStage("WITHDRAWN");
        return toResponse(applicationRepository.save(app));
    }

    private Application findOrThrow(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    private ApplicationResponse toResponse(Application app) {
        SnapshotSummaryResponse snapshotSummary = null;
        if (app.getSnapshot() != null) {
            ApplicationProfileSnapshot s = app.getSnapshot();
            snapshotSummary = SnapshotSummaryResponse.builder()
                    .candidateName(s.getCandidateName())
                    .email(s.getEmail())
                    .phoneNumber(s.getPhoneNumber())
                    .totalExperienceYears(s.getTotalExperienceYears())
                    .noticePeriodDays(s.getNoticePeriodDays())
                    .build();
        }

        return ApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .candidateEmail(app.getCandidateEmail())
                .candidateId(app.getCandidateId())
                .jobId(app.getJobId())
                .jobTitle(app.getJobTitle())
                .source(app.getSource())
                .currentStage(app.getCurrentStage())
                .aiScore(app.getAiScore())
                .resumeOriginalFilename(app.getResumeOriginalFilename())
                .appliedAt(app.getAppliedAt())
                .lastUpdatedAt(app.getLastUpdatedAt())
                .blockedFromReapply(app.getBlockedFromReapply())
                .snapshot(snapshotSummary)
                .build();
    }
}
