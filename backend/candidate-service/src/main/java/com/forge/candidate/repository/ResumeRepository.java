package com.forge.candidate.repository;

import com.forge.candidate.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findByCandidateCandidateIdAndIsActiveTrue(Long candidateId);
    List<Resume> findByCandidateCandidateIdOrderByVersionDesc(Long candidateId);
}
