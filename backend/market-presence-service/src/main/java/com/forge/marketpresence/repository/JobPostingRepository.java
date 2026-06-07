package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByPostingStatusAndIsDeletedFalse(String postingStatus);
    java.util.Optional<JobPosting> findBySlugAndIsDeletedFalse(String slug);
    List<JobPosting> findByIsDeletedFalse();
}
