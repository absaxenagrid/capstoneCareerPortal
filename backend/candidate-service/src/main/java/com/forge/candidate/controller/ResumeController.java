package com.forge.candidate.controller;

import com.forge.candidate.dto.response.ResumeResponse;
import com.forge.candidate.service.ResumeParseService;
import com.forge.candidate.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService       resumeService;
    private final ResumeParseService  resumeParseService;

    /**
     * POST /api/resumes/parse
     * Accepts multipart/form-data with field "file" (PDF, DOCX, DOC).
     * Returns structured candidate data extracted from the resume.
     * Response: { fullName, email, phone, location, linkedin, github, portfolio,
     *             education[], experience[], totalExperience, totalExperienceYears }
     */
    @PostMapping(value = "/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> parseResume(
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF, DOC, DOCX supported"));
        }

        Map<String, Object> parsed = resumeParseService.parse(file);
        return ResponseEntity.ok(parsed);
    }

    /**
     * POST /api/resumes/register/{candidateId}
     * Called after uploading to MinIO via file-service.
     */
    @PostMapping("/register/{candidateId}")
    public ResponseEntity<ResumeResponse> register(
            @PathVariable Long candidateId,
            @RequestBody Map<String, String> body) {

        String objectKey        = body.get("objectKey");
        String originalFilename = body.get("originalFilename");

        if (objectKey == null || objectKey.isBlank())
            return ResponseEntity.badRequest().build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.registerResume(candidateId, objectKey, originalFilename));
    }

    @GetMapping("/{candidateId}/active")
    public ResponseEntity<ResumeResponse> getActive(@PathVariable Long candidateId) {
        return ResponseEntity.ok(resumeService.getActiveResume(candidateId));
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<List<ResumeResponse>> getAll(@PathVariable Long candidateId) {
        return ResponseEntity.ok(resumeService.getAllResumes(candidateId));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> delete(@PathVariable Long resumeId) {
        resumeService.deleteResume(resumeId);
        return ResponseEntity.noContent().build();
    }
}
