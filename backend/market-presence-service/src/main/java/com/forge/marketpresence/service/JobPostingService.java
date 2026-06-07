package com.forge.marketpresence.service;

import com.forge.marketpresence.dto.request.JobPostingRequest;
import com.forge.marketpresence.entity.JobPosting;
import com.forge.marketpresence.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository repository;

    @Transactional
    public JobPosting create(JobPostingRequest req) {
        JobPosting jp = JobPosting.builder()
                .demandId(req.getDemandId())
                .roleTitle(req.getRoleTitle())
                .slug(req.getSlug())
                .description(req.getDescription())
                .skillsRequired(req.getSkillsRequired())
                .responsibilities(req.getResponsibilities())
                .benefits(req.getBenefits())
                .employmentType(req.getEmploymentType())
                .experienceLevel(req.getExperienceLevel())
                .experienceYears(req.getExperienceYears())
                .workMode(req.getWorkMode())
                .locationCity(req.getLocationCity())
                .locationState(req.getLocationState())
                .locationCountry(req.getLocationCountry())
                .department(req.getDepartment())
                .jobCategory(req.getJobCategory())
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .currency(req.getCurrency())
                .showSalary(req.getShowSalary() != null ? req.getShowSalary() : false)
                .postingStatus("DRAFT")
                .metaTitle(req.getMetaTitle())
                .metaDescription(req.getMetaDescription())
                .createdBy(req.getCreatedBy())
                .isDeleted(false)
                .build();
        return repository.save(jp);
    }

    @Transactional(readOnly = true)
    public List<JobPosting> listPublished() {
        return repository.findByPostingStatusAndIsDeletedFalse("PUBLISHED");
    }

    @Transactional(readOnly = true)
    public List<JobPosting> listAll() {
        return repository.findByIsDeletedFalse();
    }

    @Transactional(readOnly = true)
    public JobPosting getBySlug(String slug) {
        return repository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new RuntimeException("Job posting not found: " + slug));
    }

    @Transactional
    public JobPosting publish(Long id) {
        JobPosting jp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found: " + id));
        jp.setPostingStatus("PUBLISHED");
        jp.setPublishedAt(OffsetDateTime.now());
        return repository.save(jp);
    }

    @Transactional
    public void softDelete(Long id) {
        JobPosting jp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found: " + id));
        jp.setIsDeleted(true);
        repository.save(jp);
    }
}
