package com.resumeanalyser.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResumeRequest {

    @NotBlank(message = "Resume title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String targetRole;

    @NotBlank(message = "Resume text content is required")
    private String content;

    private String jobDescription;

    public ResumeRequest() {
    }

    public ResumeRequest(String title, String targetRole, String content, String jobDescription) {
        this.title = title;
        this.targetRole = targetRole;
        this.content = content;
        this.jobDescription = jobDescription;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}
