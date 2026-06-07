package com.forge.application.controller;

import com.forge.application.dto.request.ApplyJobRequest;
import com.forge.application.dto.response.ApplicationResponse;
import com.forge.application.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * POST /api/applications/apply
     * Submit a new application. Returns 409 on duplicate (same email + jobId).
     */
    @PostMapping("/apply")
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyForJob(request));
    }

    /**
     * GET /api/applications/candidate?email=...&page=0&size=10
     * List all applications for a candidate by email (no auth).
     */
    @GetMapping("/candidate")
    public ResponseEntity<Page<ApplicationResponse>> getCandidateApplicationsByEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getCandidateApplicationsByEmail(
                email, PageRequest.of(page, size, Sort.by("appliedAt").descending())));
    }

    /**
     * GET /api/applications/{applicationId}
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getById(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.getApplicationById(applicationId));
    }

    /**
     * PATCH /api/applications/{applicationId}/withdraw
     */
    @PatchMapping("/{applicationId}/withdraw")
    public ResponseEntity<ApplicationResponse> withdraw(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.withdrawApplication(applicationId));
    }
}
