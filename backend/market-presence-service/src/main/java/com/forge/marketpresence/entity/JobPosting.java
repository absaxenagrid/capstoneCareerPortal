package com.forge.marketpresence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "job_postings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "demand_id")        private Long demandId;
    @Column(name = "role_title")       private String roleTitle;
    @Column(name = "slug", unique = true) private String slug;

    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "skills_required", columnDefinition = "TEXT") private String skillsRequired;
    @Column(columnDefinition = "TEXT") private String responsibilities;
    @Column(columnDefinition = "TEXT") private String benefits;

    @Column(name = "employment_type")  private String employmentType;
    @Column(name = "experience_level") private String experienceLevel;
    @Column(name = "experience_years") private String experienceYears;
    @Column(name = "work_mode")        private String workMode;

    @Column(name = "location_city")    private String locationCity;
    @Column(name = "location_state")   private String locationState;
    @Column(name = "location_country") private String locationCountry;
    @Column private String department;
    @Column(name = "job_category")     private String jobCategory;

    @Column(name = "salary_min", precision = 15, scale = 2) private BigDecimal salaryMin;
    @Column(name = "salary_max", precision = 15, scale = 2) private BigDecimal salaryMax;
    @Column private String currency;
    @Column(name = "show_salary")      private Boolean showSalary = false;

    @Column(name = "posting_status")   private String postingStatus = "DRAFT";
    @Column(name = "meta_title")       private String metaTitle;
    @Column(name = "meta_description") private String metaDescription;

    @Column(name = "published_at")     private OffsetDateTime publishedAt;
    @Column(name = "closed_at")        private OffsetDateTime closedAt;
    @Column(name = "expires_at")       private OffsetDateTime expiresAt;

    @Column(name = "created_by")       private Long createdBy;
    @Column(name = "updated_by")       private Long updatedBy;
    @Column(name = "is_deleted")       private Boolean isDeleted = false;

    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at")       private LocalDateTime updatedAt;

    @PrePersist void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
