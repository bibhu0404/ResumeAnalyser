package com.resumeanalyser.repository;

import com.resumeanalyser.model.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findByResumeIdOrderByCreatedAtDesc(Long resumeId);
    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ResumeAnalysis> findByIdAndUserId(Long id, Long userId);
    Optional<ResumeAnalysis> findFirstByResumeIdOrderByCreatedAtDesc(Long resumeId);

    @Query("SELECT AVG(ra.atsScore) FROM ResumeAnalysis ra WHERE ra.user.id = :userId")
    Double findAverageAtsScoreByUserId(@Param("userId") Long userId);
}
