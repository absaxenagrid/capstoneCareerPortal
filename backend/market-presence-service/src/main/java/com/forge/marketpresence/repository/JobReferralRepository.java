package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.JobReferral;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobReferralRepository extends JpaRepository<JobReferral, Long> {
    java.util.Optional<JobReferral> findByReferralCode(String referralCode);
}
