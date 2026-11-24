package com.resumeanalyser.service;

import com.resumeanalyser.dto.AnalysisResultDto;
import com.resumeanalyser.dto.DashboardStatsDto;
import com.resumeanalyser.dto.ResumeResponse;
import com.resumeanalyser.repository.ResumeAnalysisRepository;
import com.resumeanalyser.repository.ResumeRepository;
import com.resumeanalyser.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeService resumeService;
    private final ResumeAnalyzerService resumeAnalyzerService;

    public DashboardService(ResumeRepository resumeRepository,
                            ResumeAnalysisRepository resumeAnalysisRepository,
                            ResumeService resumeService,
                            ResumeAnalyzerService resumeAnalyzerService) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.resumeService = resumeService;
        this.resumeAnalyzerService = resumeAnalyzerService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(UserPrincipal userPrincipal) {
        long totalResumes = resumeRepository.countByUserId(userPrincipal.getId());
        List<AnalysisResultDto> recentAnalyses = resumeAnalyzerService.getUserRecentAnalyses(userPrincipal);
        long totalAnalyses = recentAnalyses.size();

        Double avgScore = resumeAnalysisRepository.findAverageAtsScoreByUserId(userPrincipal.getId());
        int averageAtsScore = avgScore != null ? (int) Math.round(avgScore) : 0;

        List<ResumeResponse> recentResumes = resumeService.getUserResumes(userPrincipal).stream()
                .limit(5)
                .toList();

        return new DashboardStatsDto(
                totalResumes,
                averageAtsScore,
                totalAnalyses,
                recentResumes,
                recentAnalyses
        );
    }
}
