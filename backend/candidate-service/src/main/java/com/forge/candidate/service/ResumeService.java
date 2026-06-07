package com.forge.candidate.service;

import com.forge.candidate.dto.response.ResumeResponse;
import com.forge.candidate.entity.Candidate;
import com.forge.candidate.entity.Resume;
import com.forge.candidate.exception.ResourceNotFoundException;
import com.forge.candidate.repository.CandidateRepository;
import com.forge.candidate.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CandidateRepository candidateRepository;

    /**
     * Register a resume that was already uploaded to MinIO via file-service.
     * Deactivates all previous resumes and creates a new active one.
     */
    public ResumeResponse registerResume(Long candidateId, String objectKey, String originalFilename) {
        Candidate candidate = candidateRepository.findByCandidateIdAndIsDeletedFalse(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + candidateId));

        // Deactivate existing resumes and find next version number
        List<Resume> existing = resumeRepository.findByCandidateCandidateIdOrderByVersionDesc(candidateId);
        int nextVersion = existing.isEmpty() ? 1 : existing.get(0).getVersion() + 1;
        existing.forEach(r -> r.setIsActive(false));
        if (!existing.isEmpty()) resumeRepository.saveAll(existing);

        Resume resume = Resume.builder()
                .candidate(candidate)
                .objectKey(objectKey)
                .originalFilename(originalFilename != null ? originalFilename : "resume.pdf")
                .isActive(true)
                .version(nextVersion)
                .build();

        Resume saved = resumeRepository.save(resume);
        log.info("Registered resume for candidateId={}, version={}, key={}", candidateId, nextVersion, objectKey);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ResumeResponse getActiveResume(Long candidateId) {
        return resumeRepository.findByCandidateCandidateIdAndIsActiveTrue(candidateId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No active resume for candidate: " + candidateId));
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getAllResumes(Long candidateId) {
        return resumeRepository.findByCandidateCandidateIdOrderByVersionDesc(candidateId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void deleteResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
        resumeRepository.delete(resume);
        log.info("Deleted resumeId={}", resumeId);
    }

    private ResumeResponse toResponse(Resume r) {
        return ResumeResponse.builder()
                .resumeId(r.getResumeId())
                .objectKey(r.getObjectKey())
                .originalFilename(r.getOriginalFilename())
                .isActive(r.getIsActive())
                .version(r.getVersion())
                .uploadedAt(r.getUploadedAt())
                .build();
    }
}
