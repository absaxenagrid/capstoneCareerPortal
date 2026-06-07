package com.forge.candidate.repository;

import com.forge.candidate.entity.CandidatePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PreferenceRepository extends JpaRepository<CandidatePreference, Long> {
    Optional<CandidatePreference> findByCandidateCandidateId(Long candidateId);
}
