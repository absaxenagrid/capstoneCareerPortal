package com.forge.candidate.repository;

import com.forge.candidate.entity.EducationDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EducationRepository extends JpaRepository<EducationDetail, Long> {
    List<EducationDetail> findByCandidateCandidateIdAndDeletedFalse(Long candidateId);
    Optional<EducationDetail> findByEducationIdAndDeletedFalse(Long educationId);
}
