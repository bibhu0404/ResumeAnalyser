package com.resumeanalyser.controller;

import com.resumeanalyser.dto.ResumeRequest;
import com.resumeanalyser.dto.ResumeResponse;
import com.resumeanalyser.security.UserPrincipal;
import com.resumeanalyser.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getUserResumes(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeResponse> resumes = resumeService.getUserResumes(userPrincipal);
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResumeById(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                        @PathVariable Long id) {
        ResumeResponse resume = resumeService.getResumeById(userPrincipal, id);
        return ResponseEntity.ok(resume);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "targetRole", required = false) String targetRole) {
        ResumeResponse response = resumeService.uploadResumeFile(userPrincipal, file, title, targetRole);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/text")
    public ResponseEntity<ResumeResponse> createResumeFromText(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ResumeRequest request) {
        ResumeResponse response = resumeService.createResumeFromText(userPrincipal, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeResponse> updateResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody ResumeRequest request) {
        ResumeResponse response = resumeService.updateResume(userPrincipal, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        resumeService.deleteResume(userPrincipal, id);
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully", "id", id.toString()));
    }
}
