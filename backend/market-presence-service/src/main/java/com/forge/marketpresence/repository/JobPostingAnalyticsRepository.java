package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.JobPostingAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingAnalyticsRepository extends JpaRepository<JobPostingAnalytics, Long> {
    List<JobPostingAnalytics> findByJobPostingId(Long jobPostingId);
}
