package com.forge.marketpresence.repository;

import com.forge.marketpresence.entity.ApplySession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplySessionRepository extends JpaRepository<ApplySession, Long> {
    java.util.Optional<ApplySession> findBySessionToken(String sessionToken);
}
