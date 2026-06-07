package com.forge.candidate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_master")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SkillMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_master_id")
    private Long skillMasterId;

    @Column(name = "skill_name", nullable = false, unique = true)
    private String skillName;

    @Column(name = "category")
    private String category;
}
