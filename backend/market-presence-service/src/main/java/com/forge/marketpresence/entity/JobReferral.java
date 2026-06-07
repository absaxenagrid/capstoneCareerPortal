package com.forge.marketpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "job_referrals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobReferral {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "job_posting_id", nullable = false) private Long jobPostingId;
    @Column(name = "referred_by")     private Long referredBy;
    @Column(name = "candidate_name")  private String candidateName;
    @Column(name = "candidate_email") private String candidateEmail;
    @Column(name = "candidate_phone") private String candidatePhone;
    @Column private String relationship;
    @Column(name = "referral_note", columnDefinition = "TEXT") private String referralNote;
    @Column(name = "referral_code", unique = true) private String referralCode;
    @Column(name = "referral_status") private String referralStatus;
    @Column(name = "application_intake_id") private Long applicationIntakeId;
    @Column(name = "bonus_eligible")  private Boolean bonusEligible = false;
    @Column(name = "bonus_amount", precision = 15, scale = 2) private BigDecimal bonusAmount;
    @Column(name = "bonus_paid")      private Boolean bonusPaid = false;
    @Column(name = "status_updated_at") private OffsetDateTime statusUpdatedAt;
    @Column(name = "created_at")      private OffsetDateTime createdAt;
}
