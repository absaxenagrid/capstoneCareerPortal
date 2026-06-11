package com.forge.candidate.service;

import com.forge.candidate.dto.request.CreateCandidateRequest;
import com.forge.candidate.dto.response.CandidateResponse;
import com.forge.candidate.entity.Candidate;
import com.forge.candidate.exception.DuplicateResourceException;
import com.forge.candidate.exception.ResourceNotFoundException;
import com.forge.candidate.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock
    CandidateRepository candidateRepository;

    @Mock
    EducationRepository educationRepository;

    @Mock
    ExperienceRepository experienceRepository;

    @Mock
    CandidateSkillRepository skillRepository;

    @Mock
    PreferenceRepository preferenceRepository;

    @Mock
    ResumeRepository resumeRepository;

    @Mock
    SkillMasterRepository skillMasterRepository;

    @InjectMocks
    CandidateService candidateService;

    private CreateCandidateRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = CreateCandidateRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@test.com")
                .phoneNumber("+1234567890")
                .build();
    }

    @Test
    void createCandidate_success() {
        when(candidateRepository.existsByEmail(anyString())).thenReturn(false);

        Candidate saved = Candidate.builder()
                .candidateId(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@test.com")
                .source("PORTAL")
                .isDeleted(false)
                .build();

        when(candidateRepository.save(any())).thenReturn(saved);
        when(resumeRepository.findByCandidateCandidateIdAndIsActiveTrue(1L))
                .thenReturn(Optional.empty());

        CandidateResponse response = candidateService.createCandidate(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("john.doe@test.com");

        verify(candidateRepository).save(any(Candidate.class));
    }

    @Test
    void createCandidate_duplicateEmail_throwsException() {
        when(candidateRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> candidateService.createCandidate(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void getCandidateById_notFound_throwsException() {
        when(candidateRepository.findByCandidateIdAndIsDeletedFalse(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidateService.getCandidateById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void deleteCandidate_softDelete() {
        Candidate c = Candidate.builder()
                .candidateId(1L)
                .isDeleted(false)
                .build();

        when(candidateRepository.findByCandidateIdAndIsDeletedFalse(1L))
                .thenReturn(Optional.of(c));

        when(candidateRepository.save(any()))
                .thenReturn(c);

        candidateService.deleteCandidate(1L);

        assertThat(c.getIsDeleted()).isTrue();

        verify(candidateRepository).save(c);
    }

    @Test
    void getSkillSuggestions_returnsMatchingSkills() {
        var master = new com.forge.candidate.entity.SkillMaster(
                1L,
                "Java",
                "Language"
        );

        when(skillMasterRepository.findBySkillNameStartingWithIgnoreCase("jav"))
                .thenReturn(java.util.List.of(master));

        var result = candidateService.getSkillSuggestions("jav");

        assertThat(result).contains("Java");
    }
}