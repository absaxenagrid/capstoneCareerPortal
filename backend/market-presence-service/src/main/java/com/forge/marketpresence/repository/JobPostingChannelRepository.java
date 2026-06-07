package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.JobPostingChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingChannelRepository extends JpaRepository<JobPostingChannel, Long> {
    List<JobPostingChannel> findByJobPostingId(Long jobPostingId);
}
