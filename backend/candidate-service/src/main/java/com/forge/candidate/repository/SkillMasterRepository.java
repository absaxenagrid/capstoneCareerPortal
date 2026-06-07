package com.forge.candidate.repository;

import com.forge.candidate.entity.SkillMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillMasterRepository extends JpaRepository<SkillMaster, Long> {

    @Query("SELECT s FROM SkillMaster s WHERE LOWER(s.skillName) LIKE LOWER(CONCAT(:keyword, '%')) ORDER BY s.skillName")
    List<SkillMaster> findBySkillNameStartingWithIgnoreCase(@Param("keyword") String keyword);
}
