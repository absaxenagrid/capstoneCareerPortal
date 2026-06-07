package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByCandidateEmail(String candidateEmail);
}
