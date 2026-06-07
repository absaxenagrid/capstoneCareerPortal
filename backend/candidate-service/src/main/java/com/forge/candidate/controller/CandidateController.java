package com.forge.candidate.controller;

import com.forge.candidate.dto.request.*;
import com.forge.candidate.dto.response.*;
import com.forge.candidate.service.CandidateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Candidate API", description = "Candidate Profile Management")
public class CandidateController {

    private final CandidateService candidateService;

    // ---- Candidate ----

    @PostMapping("/candidates")
    @Operation(summary = "Create candidate")
    public ResponseEntity<CandidateResponse> create(@Valid @RequestBody CreateCandidateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.createCandidate(request));
    }

    @GetMapping("/candidates/{id}")
    @Operation(summary = "Get candidate by ID")
    public ResponseEntity<CandidateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }

    @PutMapping("/candidates/{id}")
    @Operation(summary = "Update candidate")
    public ResponseEntity<CandidateResponse> update(@PathVariable Long id, @Valid @RequestBody CreateCandidateRequest req) {
        return ResponseEntity.ok(candidateService.updateCandidate(id, req));
    }

    @DeleteMapping("/candidates/{id}")
    @Operation(summary = "Delete candidate (soft)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/candidates")
    @Operation(summary = "List all candidates (paginated)")
    public ResponseEntity<Page<CandidateResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(candidateService.getAllCandidates(PageRequest.of(page, size)));
    }

    // ---- Education ----

    @PostMapping("/candidates/{id}/education")
    public ResponseEntity<EducationResponse> addEducation(@PathVariable Long id,
                                                           @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.addEducation(id, request));
    }

    @GetMapping("/candidates/{id}/education")
    public ResponseEntity<List<EducationResponse>> getEducation(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getEducation(id));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationResponse> updateEducation(@PathVariable Long id,
                                                              @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(candidateService.updateEducation(id, request));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long id) {
        candidateService.deleteEducation(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Experience ----

    @PostMapping("/candidates/{id}/experience")
    public ResponseEntity<ExperienceResponse> addExperience(@PathVariable Long id,
                                                             @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.addExperience(id, request));
    }

    @GetMapping("/candidates/{id}/experience")
    public ResponseEntity<List<ExperienceResponse>> getExperience(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getExperience(id));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ExperienceResponse> updateExperience(@PathVariable Long id,
                                                                @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(candidateService.updateExperience(id, request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        candidateService.deleteExperience(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Skills ----

    @PostMapping("/candidates/{id}/skills")
    public ResponseEntity<SkillResponse> addSkill(@PathVariable Long id,
                                                   @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(candidateService.addSkill(id, body.get("skillName")));
    }

    @GetMapping("/candidates/{id}/skills")
    public ResponseEntity<List<SkillResponse>> getSkills(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getSkills(id));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        candidateService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/skills/suggestions")
    @Operation(summary = "Get skill suggestions by keyword")
    public ResponseEntity<List<String>> getSkillSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(candidateService.getSkillSuggestions(keyword));
    }

    // ---- Preferences ----

    @PostMapping("/candidates/{id}/preferences")
    public ResponseEntity<PreferenceResponse> savePreferences(@PathVariable Long id,
                                                               @RequestBody PreferenceRequest request) {
        return ResponseEntity.ok(candidateService.savePreferences(id, request));
    }

    @GetMapping("/candidates/{id}/preferences")
    public ResponseEntity<PreferenceResponse> getPreferences(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getPreferences(id));
    }

    @PutMapping("/candidates/{id}/preferences")
    public ResponseEntity<PreferenceResponse> updatePreferences(@PathVariable Long id,
                                                                  @RequestBody PreferenceRequest request) {
        return ResponseEntity.ok(candidateService.savePreferences(id, request));
    }
}
