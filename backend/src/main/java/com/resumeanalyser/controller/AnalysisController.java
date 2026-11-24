package com.resumeanalyser.controller;

import com.resumeanalyser.dto.AnalysisResultDto;
import com.resumeanalyser.dto.AnalyzeRequest;
import com.resumeanalyser.security.UserPrincipal;
import com.resumeanalyser.service.ResumeAnalyzerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private final ResumeAnalyzerService resumeAnalyzerService;

    public AnalysisController(ResumeAnalyzerService resumeAnalyzerService) {
        this.resumeAnalyzerService = resumeAnalyzerService;
    }

    @PostMapping("/resumes/{resumeId}/analyze")
    public ResponseEntity<AnalysisResultDto> analyzeResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long resumeId,
            @RequestBody(required = false) AnalyzeRequest request) {
        AnalysisResultDto result = resumeAnalyzerService.analyzeResume(userPrincipal, resumeId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/resumes/{resumeId}/analyses")
    public ResponseEntity<List<AnalysisResultDto>> getResumeAnalyses(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long resumeId) {
        List<AnalysisResultDto> history = resumeAnalyzerService.getResumeAnalyses(userPrincipal, resumeId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/analyses/{analysisId}")
    public ResponseEntity<AnalysisResultDto> getAnalysisById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long analysisId) {
        AnalysisResultDto result = resumeAnalyzerService.getAnalysisById(userPrincipal, analysisId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/analyses/recent")
    public ResponseEntity<List<AnalysisResultDto>> getRecentAnalyses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AnalysisResultDto> recent = resumeAnalyzerService.getUserRecentAnalyses(userPrincipal);
        return ResponseEntity.ok(recent);
    }
}
