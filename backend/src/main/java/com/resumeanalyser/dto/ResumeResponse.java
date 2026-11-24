package com.resumeanalyser.dto;

import java.time.LocalDateTime;

public class ResumeResponse {

    private Long id;
    private String title;
    private String targetRole;
    private String originalFileName;
    private String fileType;
    private String rawTextContent;
    private int wordCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer latestAtsScore;
    private Integer latestMatchScore;
    private Long latestAnalysisId;

    public ResumeResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getRawTextContent() {
        return rawTextContent;
    }

    public void setRawTextContent(String rawTextContent) {
        this.rawTextContent = rawTextContent;
    }

    public int getWordCount() {
        return wordCount;
    }

    public void setWordCount(int wordCount) {
        this.wordCount = wordCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getLatestAtsScore() {
        return latestAtsScore;
    }

    public void setLatestAtsScore(Integer latestAtsScore) {
        this.latestAtsScore = latestAtsScore;
    }

    public Integer getLatestMatchScore() {
        return latestMatchScore;
    }

    public void setLatestMatchScore(Integer latestMatchScore) {
        this.latestMatchScore = latestMatchScore;
    }

    public Long getLatestAnalysisId() {
        return latestAnalysisId;
    }

    public void setLatestAnalysisId(Long latestAnalysisId) {
        this.latestAnalysisId = latestAnalysisId;
    }
}
