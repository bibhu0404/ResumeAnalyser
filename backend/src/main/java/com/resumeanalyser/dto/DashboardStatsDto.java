package com.resumeanalyser.dto;

import java.util.List;

public class DashboardStatsDto {

    private long totalResumes;
    private int averageAtsScore;
    private long totalAnalyses;
    private List<ResumeResponse> recentResumes;
    private List<AnalysisResultDto> recentAnalyses;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalResumes, int averageAtsScore, long totalAnalyses,
                             List<ResumeResponse> recentResumes, List<AnalysisResultDto> recentAnalyses) {
        this.totalResumes = totalResumes;
        this.averageAtsScore = averageAtsScore;
        this.totalAnalyses = totalAnalyses;
        this.recentResumes = recentResumes;
        this.recentAnalyses = recentAnalyses;
    }

    public long getTotalResumes() {
        return totalResumes;
    }

    public void setTotalResumes(long totalResumes) {
        this.totalResumes = totalResumes;
    }

    public int getAverageAtsScore() {
        return averageAtsScore;
    }

    public void setAverageAtsScore(int averageAtsScore) {
        this.averageAtsScore = averageAtsScore;
    }

    public long getTotalAnalyses() {
        return totalAnalyses;
    }

    public void setTotalAnalyses(long totalAnalyses) {
        this.totalAnalyses = totalAnalyses;
    }

    public List<ResumeResponse> getRecentResumes() {
        return recentResumes;
    }

    public void setRecentResumes(List<ResumeResponse> recentResumes) {
        this.recentResumes = recentResumes;
    }

    public List<AnalysisResultDto> getRecentAnalyses() {
        return recentAnalyses;
    }

    public void setRecentAnalyses(List<AnalysisResultDto> recentAnalyses) {
        this.recentAnalyses = recentAnalyses;
    }
}
