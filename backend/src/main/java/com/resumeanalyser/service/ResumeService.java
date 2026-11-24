package com.resumeanalyser.service;

import com.resumeanalyser.dto.ResumeRequest;
import com.resumeanalyser.dto.ResumeResponse;
import com.resumeanalyser.exception.BadRequestException;
import com.resumeanalyser.exception.ResourceNotFoundException;
import com.resumeanalyser.model.Resume;
import com.resumeanalyser.model.ResumeAnalysis;
import com.resumeanalyser.model.User;
import com.resumeanalyser.repository.ResumeAnalysisRepository;
import com.resumeanalyser.repository.ResumeRepository;
import com.resumeanalyser.repository.UserRepository;
import com.resumeanalyser.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;

    public ResumeService(ResumeRepository resumeRepository,
                         ResumeAnalysisRepository resumeAnalysisRepository,
                         UserRepository userRepository,
                         ResumeParserService resumeParserService) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
    }

    @Transactional
    public ResumeResponse uploadResumeFile(UserPrincipal userPrincipal, MultipartFile file,
                                          String title, String targetRole) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String extractedText = resumeParserService.extractText(file);
        String originalFilename = file.getOriginalFilename();
        String extension = resumeParserService.getFileExtension(originalFilename != null ? originalFilename : "");

        String finalTitle = (title != null && !title.isBlank())
                ? title.trim()
                : (originalFilename != null ? originalFilename.replaceAll("\\.[^.]+$", "") : "My Resume");

        Resume resume = new Resume(
                finalTitle,
                targetRole != null ? targetRole.trim() : null,
                originalFilename,
                extension.toUpperCase(),
                extractedText,
                user
        );

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional
    public ResumeResponse createResumeFromText(UserPrincipal userPrincipal, ResumeRequest request) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = new Resume(
                request.getTitle().trim(),
                request.getTargetRole() != null ? request.getTargetRole().trim() : null,
                null,
                "TEXT",
                request.getContent().trim(),
                user
        );

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getUserResumes(UserPrincipal userPrincipal) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(UserPrincipal userPrincipal, Long id) {
        Resume resume = resumeRepository.findByIdAndUserId(id, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
        return mapToResponse(resume);
    }

    @Transactional
    public ResumeResponse updateResume(UserPrincipal userPrincipal, Long id, ResumeRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(id, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        resume.setTitle(request.getTitle().trim());
        if (request.getTargetRole() != null) {
            resume.setTargetRole(request.getTargetRole().trim());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            resume.setRawTextContent(request.getContent().trim());
        }

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional
    public void deleteResume(UserPrincipal userPrincipal, Long id) {
        Resume resume = resumeRepository.findByIdAndUserId(id, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));

        resumeRepository.delete(resume);
    }

    public ResumeResponse mapToResponse(Resume resume) {
        ResumeResponse response = new ResumeResponse();
        response.setId(resume.getId());
        response.setTitle(resume.getTitle());
        response.setTargetRole(resume.getTargetRole());
        response.setOriginalFileName(resume.getOriginalFileName());
        response.setFileType(resume.getFileType());
        response.setRawTextContent(resume.getRawTextContent());
        response.setCreatedAt(resume.getCreatedAt());
        response.setUpdatedAt(resume.getUpdatedAt());

        // Count words
        if (resume.getRawTextContent() != null) {
            String[] words = resume.getRawTextContent().trim().split("\\s+");
            response.setWordCount(words.length);
        } else {
            response.setWordCount(0);
        }

        // Attach latest analysis score if available
        Optional<ResumeAnalysis> latestAnalysis = resumeAnalysisRepository.findFirstByResumeIdOrderByCreatedAtDesc(resume.getId());
        if (latestAnalysis.isPresent()) {
            response.setLatestAtsScore(latestAnalysis.get().getAtsScore());
            response.setLatestMatchScore(latestAnalysis.get().getMatchScore());
            response.setLatestAnalysisId(latestAnalysis.get().getId());
        }

        return response;
    }
}
