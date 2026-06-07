package com.forge.candidate.service;

import com.forge.candidate.dto.request.*;
import com.forge.candidate.dto.response.*;
import com.forge.candidate.entity.*;
import com.forge.candidate.exception.*;
import com.forge.candidate.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final CandidateSkillRepository skillRepository;
    private final PreferenceRepository preferenceRepository;
    private final ResumeRepository resumeRepository;
    private final SkillMasterRepository skillMasterRepository;

    // --- Candidate CRUD ---

    public CandidateResponse createCandidate(CreateCandidateRequest request) {
        if (candidateRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Candidate with email " + request.getEmail() + " already exists");
        }
        Candidate candidate = Candidate.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .source("PORTAL")
                .isDeleted(false)
                .build();
        return toCandidateResponse(candidateRepository.save(candidate));
    }

    @Transactional(readOnly = true)
    public CandidateResponse getCandidateById(Long id) {
        Candidate candidate = findCandidateOrThrow(id);
        return toCandidateResponse(candidate);
    }

    public CandidateResponse updateCandidate(Long id, CreateCandidateRequest request) {
        Candidate candidate = findCandidateOrThrow(id);
        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setPhoneNumber(request.getPhoneNumber());
        candidate.setDateOfBirth(request.getDateOfBirth());
        candidate.setGender(request.getGender());
        return toCandidateResponse(candidateRepository.save(candidate));
    }

    public void deleteCandidate(Long id) {
        Candidate candidate = findCandidateOrThrow(id);
        candidate.setIsDeleted(true);
        candidate.setDeletedAt(java.time.LocalDateTime.now());
        candidateRepository.save(candidate);
    }

    @Transactional(readOnly = true)
    public Page<CandidateResponse> getAllCandidates(Pageable pageable) {
        return candidateRepository.findAllByIsDeletedFalse(pageable)
                .map(this::toCandidateResponse);
    }

    // --- Education ---

    public EducationResponse addEducation(Long candidateId, EducationRequest request) {
        Candidate candidate = findCandidateOrThrow(candidateId);
        EducationDetail ed = EducationDetail.builder()
                .candidate(candidate)
                .degree(request.getDegree())
                .specialization(request.getSpecialization())
                .institutionName(request.getInstitutionName())
                .startYear(request.getStartYear())
                .endYear(request.getEndYear())
                .percentage(request.getPercentage())
                .deleted(false)
                .build();
        return toEducationResponse(educationRepository.save(ed));
    }

    @Transactional(readOnly = true)
    public List<EducationResponse> getEducation(Long candidateId) {
        return educationRepository.findByCandidateCandidateIdAndDeletedFalse(candidateId)
                .stream().map(this::toEducationResponse).collect(Collectors.toList());
    }

    public EducationResponse updateEducation(Long educationId, EducationRequest request) {
        EducationDetail ed = educationRepository.findByEducationIdAndDeletedFalse(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found: " + educationId));
        ed.setDegree(request.getDegree());
        ed.setSpecialization(request.getSpecialization());
        ed.setInstitutionName(request.getInstitutionName());
        ed.setStartYear(request.getStartYear());
        ed.setEndYear(request.getEndYear());
        ed.setPercentage(request.getPercentage());
        return toEducationResponse(educationRepository.save(ed));
    }

    public void deleteEducation(Long educationId) {
        EducationDetail ed = educationRepository.findByEducationIdAndDeletedFalse(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found: " + educationId));
        ed.setDeleted(true);
        educationRepository.save(ed);
    }

    // --- Experience ---

    public ExperienceResponse addExperience(Long candidateId, ExperienceRequest request) {
        Candidate candidate = findCandidateOrThrow(candidateId);
        ExperienceDetail exp = ExperienceDetail.builder()
                .candidate(candidate)
                .companyName(request.getCompanyName())
                .designation(request.getDesignation())
                .employmentType(request.getEmploymentType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentlyWorking(request.getCurrentlyWorking() != null ? request.getCurrentlyWorking() : false)
                .responsibilities(request.getResponsibilities())
                .deleted(false)
                .build();
        return toExperienceResponse(experienceRepository.save(exp));
    }

    @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperience(Long candidateId) {
        return experienceRepository.findByCandidateCandidateIdAndDeletedFalse(candidateId)
                .stream().map(this::toExperienceResponse).collect(Collectors.toList());
    }

    public ExperienceResponse updateExperience(Long experienceId, ExperienceRequest request) {
        ExperienceDetail exp = experienceRepository.findByExperienceIdAndDeletedFalse(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found: " + experienceId));
        exp.setCompanyName(request.getCompanyName());
        exp.setDesignation(request.getDesignation());
        exp.setEmploymentType(request.getEmploymentType());
        exp.setStartDate(request.getStartDate());
        exp.setEndDate(request.getEndDate());
        exp.setCurrentlyWorking(request.getCurrentlyWorking());
        exp.setResponsibilities(request.getResponsibilities());
        return toExperienceResponse(experienceRepository.save(exp));
    }

    public void deleteExperience(Long experienceId) {
        ExperienceDetail exp = experienceRepository.findByExperienceIdAndDeletedFalse(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found: " + experienceId));
        exp.setDeleted(true);
        experienceRepository.save(exp);
    }

    // --- Skills ---

    public SkillResponse addSkill(Long candidateId, String skillName) {
        Candidate candidate = findCandidateOrThrow(candidateId);
        CandidateSkill skill = CandidateSkill.builder()
                .candidate(candidate)
                .skillName(skillName)
                .deleted(false)
                .build();
        return toSkillResponse(skillRepository.save(skill));
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkills(Long candidateId) {
        return skillRepository.findByCandidateCandidateIdAndDeletedFalse(candidateId)
                .stream().map(this::toSkillResponse).collect(Collectors.toList());
    }

    public void deleteSkill(Long skillId) {
        CandidateSkill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));
        skill.setDeleted(true);
        skillRepository.save(skill);
    }

    @Transactional(readOnly = true)
    public List<String> getSkillSuggestions(String keyword) {
        return skillMasterRepository.findBySkillNameStartingWithIgnoreCase(keyword)
                .stream().map(SkillMaster::getSkillName).collect(Collectors.toList());
    }

    // --- Preferences ---

    public PreferenceResponse savePreferences(Long candidateId, PreferenceRequest request) {
        Candidate candidate = findCandidateOrThrow(candidateId);
        CandidatePreference pref = preferenceRepository.findByCandidateCandidateId(candidateId)
                .orElse(CandidatePreference.builder().candidate(candidate).build());
        pref.setWorkMode(request.getWorkMode());
        pref.setDesiredSalaryMin(request.getDesiredSalaryMin());
        pref.setDesiredSalaryMax(request.getDesiredSalaryMax());
        pref.setPreferredLocations(request.getPreferredLocations());
        pref.setNoticePeriodDays(request.getNoticePeriodDays());
        pref.setWillingToRelocate(request.getWillingToRelocate());
        return toPreferenceResponse(preferenceRepository.save(pref));
    }

    @Transactional(readOnly = true)
    public PreferenceResponse getPreferences(Long candidateId) {
        return preferenceRepository.findByCandidateCandidateId(candidateId)
                .map(this::toPreferenceResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Preferences not found for candidate: " + candidateId));
    }

    // --- Helpers ---

    private Candidate findCandidateOrThrow(Long id) {
        return candidateRepository.findByCandidateIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + id));
    }

    private CandidateResponse toCandidateResponse(Candidate c) {
        Resume activeResume = resumeRepository.findByCandidateCandidateIdAndIsActiveTrue(c.getCandidateId()).orElse(null);
        return CandidateResponse.builder()
                .candidateId(c.getCandidateId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phoneNumber(c.getPhoneNumber())
                .dateOfBirth(c.getDateOfBirth())
                .gender(c.getGender())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .activeResume(activeResume != null ? toResumeResponse(activeResume) : null)
                .build();
    }

    private EducationResponse toEducationResponse(EducationDetail e) {
        return EducationResponse.builder()
                .educationId(e.getEducationId())
                .degree(e.getDegree())
                .specialization(e.getSpecialization())
                .institutionName(e.getInstitutionName())
                .startYear(e.getStartYear())
                .endYear(e.getEndYear())
                .percentage(e.getPercentage())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private ExperienceResponse toExperienceResponse(ExperienceDetail e) {
        return ExperienceResponse.builder()
                .experienceId(e.getExperienceId())
                .companyName(e.getCompanyName())
                .designation(e.getDesignation())
                .employmentType(e.getEmploymentType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .currentlyWorking(e.getCurrentlyWorking())
                .responsibilities(e.getResponsibilities())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private SkillResponse toSkillResponse(CandidateSkill s) {
        return SkillResponse.builder()
                .skillId(s.getSkillId())
                .skillName(s.getSkillName())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private PreferenceResponse toPreferenceResponse(CandidatePreference p) {
        return PreferenceResponse.builder()
                .preferenceId(p.getPreferenceId())
                .workMode(p.getWorkMode())
                .desiredSalaryMin(p.getDesiredSalaryMin())
                .desiredSalaryMax(p.getDesiredSalaryMax())
                .preferredLocations(p.getPreferredLocations())
                .noticePeriodDays(p.getNoticePeriodDays())
                .willingToRelocate(p.getWillingToRelocate())
                .build();
    }

    private ResumeResponse toResumeResponse(Resume r) {
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
