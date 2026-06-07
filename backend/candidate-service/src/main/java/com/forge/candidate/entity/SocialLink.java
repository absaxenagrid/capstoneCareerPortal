package com.forge.candidate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_links",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_social_links_candidate_social",
           columnNames = {"candidate_id", "social"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "social_links_id")
    private Long socialLinksId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "social", nullable = false, length = 50)
    private String social;

    @Column(name = "links", nullable = false, length = 500)
    private String links;
}
