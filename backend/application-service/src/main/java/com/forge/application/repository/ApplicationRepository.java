package com.forge.application.repository;

import com.forge.application.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Email-based queries (no auth)
    Page<Application> findByCandidateEmailOrderByAppliedAtDesc(String candidateEmail, Pageable pageable);
    Optional<Application> findByCandidateEmailAndJobId(String candidateEmail, Long jobId);
    boolean existsByCandidateEmailAndJobId(String candidateEmail, Long jobId);

    // Legacy candidateId-based (kept for backward compat)
    Page<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId, Pageable pageable);
}
