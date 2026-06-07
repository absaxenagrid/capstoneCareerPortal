package com.forge.candidate.repository;

import com.forge.candidate.entity.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmailAndIsDeletedFalse(String email);
    Optional<Candidate> findByCandidateIdAndIsDeletedFalse(Long candidateId);
    Page<Candidate> findAllByIsDeletedFalse(Pageable pageable);
    boolean existsByEmail(String email);
}
