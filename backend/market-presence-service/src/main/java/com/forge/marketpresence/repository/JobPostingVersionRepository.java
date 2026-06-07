package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.JobPostingVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingVersionRepository extends JpaRepository<JobPostingVersion, Long> {
    List<JobPostingVersion> findByJobPostingIdOrderByVersionNumberDesc(Long jobPostingId);
}
