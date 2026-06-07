package com.forge.notification.repository;

import com.forge.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByCandidateEmailOrderByCreatedAtDesc(String candidateEmail, Pageable pageable);

    long countByCandidateEmailAndIsReadFalse(String candidateEmail);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.candidateEmail = :email AND n.isRead = false")
    int markAllReadByEmail(String email);
}
