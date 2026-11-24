package com.resumeanalyser.dto;

public class AnalyzeRequest {

    private String targetRole;
    private String jobDescription;

    public AnalyzeRequest() {
    }

    public AnalyzeRequest(String targetRole, String jobDescription) {
        this.targetRole = targetRole;
        this.jobDescription = jobDescription;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}
