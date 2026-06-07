package com.forge.candidate.repository;

import com.forge.candidate.entity.ExperienceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<ExperienceDetail, Long> {
    List<ExperienceDetail> findByCandidateCandidateIdAndDeletedFalse(Long candidateId);
    Optional<ExperienceDetail> findByExperienceIdAndDeletedFalse(Long experienceId);
}
