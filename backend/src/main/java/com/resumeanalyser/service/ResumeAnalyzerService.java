package com.resumeanalyser.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyser.dto.AnalysisResultDto;
import com.resumeanalyser.dto.AnalyzeRequest;
import com.resumeanalyser.exception.BadRequestException;
import com.resumeanalyser.exception.ResourceNotFoundException;
import com.resumeanalyser.model.Resume;
import com.resumeanalyser.model.ResumeAnalysis;
import com.resumeanalyser.model.User;
import com.resumeanalyser.repository.ResumeAnalysisRepository;
import com.resumeanalyser.repository.ResumeRepository;
import com.resumeanalyser.repository.UserRepository;
import com.resumeanalyser.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAnalyzerService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeAnalyzerService.class);

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.base-url:https://api.openai.com/v1}")
    private String aiBaseUrl;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String aiModel;

    public ResumeAnalyzerService(ResumeRepository resumeRepository,
                                 ResumeAnalysisRepository resumeAnalysisRepository,
                                 UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        this.restClient = RestClient.builder().build();
    }

    @Transactional
    public AnalysisResultDto analyzeResume(UserPrincipal userPrincipal, Long resumeId, AnalyzeRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String targetRole = (request != null && request.getTargetRole() != null && !request.getTargetRole().isBlank())
                ? request.getTargetRole().trim()
                : (resume.getTargetRole() != null ? resume.getTargetRole() : "Software Engineer");

        String jobDescription = (request != null && request.getJobDescription() != null)
                ? request.getJobDescription().trim()
                : "";

        String resumeContent = resume.getRawTextContent();
        if (resumeContent == null || resumeContent.trim().length() < 30) {
            throw new BadRequestException("Resume content is too short or empty to perform analysis.");
        }

        AnalysisResultDto resultDto = null;
        String modelName = "Local Heuristic ATS Engine (v1.0)";

        // Check if user provided an LLM API key
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("none")) {
            try {
                resultDto = callLlmForAnalysis(resumeContent, targetRole, jobDescription);
                modelName = aiModel + " via Spring AI / LLM";
            } catch (Exception e) {
                logger.warn("LLM API call failed or timed out. Falling back to local heuristic analysis. Reason: {}", e.getMessage());
            }
        }

        // If no API key or call failed, execute high-quality local analysis
        if (resultDto == null) {
            resultDto = performLocalHeuristicAnalysis(resumeContent, targetRole, jobDescription);
        }

        resultDto.setModelUsed(modelName);
        resultDto.setTargetRole(targetRole);
        resultDto.setJobDescription(jobDescription);
        resultDto.setResumeId(resume.getId());
        resultDto.setResumeTitle(resume.getTitle());

        // Save analysis to MySQL database
        ResumeAnalysis entity = new ResumeAnalysis();
        entity.setResume(resume);
        entity.setUser(user);
        entity.setTargetRole(targetRole);
        entity.setJobDescription(jobDescription);
        entity.setAtsScore(resultDto.getAtsScore());
        entity.setMatchScore(resultDto.getMatchScore());
        entity.setSummary(resultDto.getSummary());
        entity.setModelUsed(modelName);

        try {
            entity.setPresentSkills(objectMapper.writeValueAsString(resultDto.getPresentSkills()));
            entity.setMissingSkills(objectMapper.writeValueAsString(resultDto.getMissingSkills()));
            entity.setStrengths(objectMapper.writeValueAsString(resultDto.getStrengths()));
            entity.setWeaknesses(objectMapper.writeValueAsString(resultDto.getWeaknesses()));
            entity.setRecommendations(objectMapper.writeValueAsString(resultDto.getRecommendations()));
            entity.setSectionFeedback(objectMapper.writeValueAsString(resultDto.getSectionFeedback()));
            entity.setInterviewQuestions(objectMapper.writeValueAsString(resultDto.getInterviewQuestions()));
        } catch (Exception e) {
            logger.error("Failed to serialize analysis JSON fields", e);
        }

        entity = resumeAnalysisRepository.save(entity);
        resultDto.setId(entity.getId());
        resultDto.setCreatedAt(entity.getCreatedAt());

        return resultDto;
    }

    private AnalysisResultDto callLlmForAnalysis(String resumeText, String targetRole, String jobDescription) {
        String systemPrompt = """
                You are a Senior Technical Recruiter and ATS (Applicant Tracking System) Expert.
                Analyze the provided candidate resume thoroughly against the target role and optional job description.
                You MUST return ONLY a valid JSON object with EXACTLY this structure:
                {
                  "atsScore": 85,
                  "matchScore": 80,
                  "summary": "2-3 sentence executive summary of the candidate's profile and readiness.",
                  "presentSkills": ["Skill 1", "Skill 2", ...],
                  "missingSkills": ["Skill A", "Skill B", ...],
                  "strengths": ["Clear strength 1", "Clear strength 2", ...],
                  "weaknesses": ["Area of improvement 1", "Area of improvement 2", ...],
                  "recommendations": ["Actionable step 1", "Actionable step 2", ...],
                  "sectionFeedback": {
                    "Contact Info": "Detailed feedback",
                    "Professional Summary": "Detailed feedback",
                    "Experience": "Detailed feedback",
                    "Skills": "Detailed feedback",
                    "Education": "Detailed feedback",
                    "Formatting & ATS": "Detailed feedback"
                  },
                  "interviewQuestions": [
                    "Technical or behavioral question 1 tailored to resume",
                    "Technical or behavioral question 2",
                    "Technical or behavioral question 3",
                    "Technical or behavioral question 4",
                    "Technical or behavioral question 5"
                  ]
                }
                Do not include markdown code fences or backticks. Return valid raw JSON.
                """;

        String userPrompt = "TARGET ROLE: " + targetRole + "\n\n"
                + (jobDescription != null && !jobDescription.isBlank() ? "JOB DESCRIPTION:\n" + jobDescription + "\n\n" : "")
                + "RESUME CONTENT:\n" + resumeText;

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("model", aiModel);
        requestPayload.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));
        requestPayload.put("messages", messages);

        String endpoint = aiBaseUrl.endsWith("/") ? aiBaseUrl + "chat/completions" : aiBaseUrl + "/chat/completions";

        String responseBody = restClient.post()
                .uri(endpoint)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestPayload)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Strip any accidental markdown formatting ```json ... ```
            content = cleanJsonMarkdown(content);

            AnalysisResultDto dto = objectMapper.readValue(content, AnalysisResultDto.class);
            return dto;
        } catch (Exception e) {
            logger.error("Failed to parse LLM response into AnalysisResultDto", e);
            throw new RuntimeException("Could not parse LLM output: " + e.getMessage());
        }
    }

    private String cleanJsonMarkdown(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    /**
     * Comprehensive rule-based and keyword ATS analyzer that runs locally without requiring external API keys.
     */
    public AnalysisResultDto performLocalHeuristicAnalysis(String resumeText, String targetRole, String jobDescription) {
        AnalysisResultDto dto = new AnalysisResultDto();
        String lowerText = resumeText.toLowerCase();

        // 1. Skill Extraction
        List<String> knownSkills = Arrays.asList(
                "Java", "Spring Boot", "Spring Security", "React", "JavaScript", "TypeScript",
                "HTML", "CSS", "Tailwind CSS", "MySQL", "PostgreSQL", "MongoDB", "Redis",
                "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Git", "GitHub",
                "CI/CD", "REST API", "GraphQL", "Microservices", "Python", "Node.js", "Express",
                "Linux", "Unit Testing", "JUnit", "Agile", "Scrum", "Next.js", "C++", "C#", ".NET"
        );

        List<String> presentSkills = knownSkills.stream()
                .filter(skill -> lowerText.contains(skill.toLowerCase()))
                .collect(Collectors.toList());

        // Target role skills benchmark
        List<String> targetBenchmarks = getRoleBenchmarkSkills(targetRole);
        List<String> missingSkills = targetBenchmarks.stream()
                .filter(skill -> !presentSkills.stream().anyMatch(ps -> ps.equalsIgnoreCase(skill)))
                .limit(6)
                .collect(Collectors.toList());

        dto.setPresentSkills(presentSkills.isEmpty() ? List.of("Communication", "Problem Solving", "Documentation") : presentSkills);
        dto.setMissingSkills(missingSkills);

        // 2. Metrics & ATS Checkers
        boolean hasEmail = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(resumeText).find();
        boolean hasPhone = Pattern.compile("(\\+?[0-9]{1,3}[-.\\s]?)?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}").matcher(resumeText).find();
        boolean hasLinkedIn = lowerText.contains("linkedin.com");
        boolean hasGitHub = lowerText.contains("github.com");

        int wordCount = resumeText.trim().split("\\s+").length;
        boolean hasGoodLength = wordCount >= 300 && wordCount <= 1000;

        // Action verbs
        List<String> actionVerbs = Arrays.asList(
                "developed", "engineered", "built", "designed", "implemented", "optimized",
                "led", "managed", "increased", "reduced", "delivered", "collaborated", "spearheaded"
        );
        long actionVerbCount = actionVerbs.stream().filter(lowerText::contains).count();

        // Quantifiable numbers / percentages ($ % k +)
        Matcher numberMatcher = Pattern.compile("(\\d+%|\\$\\d+|\\d+\\+?\\s*(users|clients|requests|ms|hours|team))").matcher(lowerText);
        int metricsCount = 0;
        while (numberMatcher.find()) {
            metricsCount++;
        }

        // Section header presence
        boolean hasExperience = lowerText.contains("experience") || lowerText.contains("work history");
        boolean hasEducation = lowerText.contains("education") || lowerText.contains("university") || lowerText.contains("degree");
        boolean hasProjects = lowerText.contains("project") || lowerText.contains("portfolio");
        boolean hasSummary = lowerText.contains("summary") || lowerText.contains("objective") || lowerText.contains("about");

        // Calculate ATS Score (0 - 100)
        int score = 40;
        if (hasEmail) score += 5;
        if (hasPhone) score += 5;
        if (hasLinkedIn || hasGitHub) score += 5;
        if (hasGoodLength) score += 10;
        if (hasExperience) score += 10;
        if (hasEducation) score += 5;
        if (hasProjects) score += 5;
        if (hasSummary) score += 5;
        if (actionVerbCount >= 4) score += 5;
        if (metricsCount >= 2) score += 5;

        // Skill count bonus
        score += Math.min(presentSkills.size(), 10);
        score = Math.min(Math.max(score, 35), 98);
        dto.setAtsScore(score);

        // Match Score based on Target Role & Job Description
        int match = 60;
        if (!targetBenchmarks.isEmpty()) {
            long matchedCount = targetBenchmarks.stream()
                    .filter(skill -> presentSkills.stream().anyMatch(ps -> ps.equalsIgnoreCase(skill)))
                    .count();
            match = (int) Math.round(((double) matchedCount / targetBenchmarks.size()) * 100);
            match = Math.max(match, 45);
        }
        if (jobDescription != null && !jobDescription.isBlank()) {
            String[] jdWords = jobDescription.toLowerCase().split("\\s+");
            long matchedJdWords = Arrays.stream(jdWords)
                    .filter(w -> w.length() > 4 && lowerText.contains(w))
                    .count();
            if (matchedJdWords > 5) match = Math.min(match + 10, 95);
        }
        dto.setMatchScore(Math.min(match, 96));

        // 3. Summary
        dto.setSummary("Profile demonstrates solid foundational experience relevant to " + targetRole +
                ". The resume highlights " + presentSkills.size() + " key technical proficiencies with strong structural organization and career progression.");

        // 4. Strengths
        List<String> strengths = new ArrayList<>();
        if (hasExperience) strengths.add("Clear professional experience section with chronological roles.");
        if (!presentSkills.isEmpty()) strengths.add("Strong demonstration of relevant modern tools and technologies (" + String.join(", ", presentSkills.stream().limit(4).toList()) + ").");
        if (actionVerbCount >= 3) strengths.add("Effective use of strong action verbs (e.g. developed, engineered, optimized).");
        if (hasProjects) strengths.add("Included practical projects showcasing applied engineering abilities.");
        if (hasEmail && hasPhone) strengths.add("Complete and easily identifiable contact details.");
        dto.setStrengths(strengths);

        // 5. Weaknesses / Improvement Areas
        List<String> weaknesses = new ArrayList<>();
        if (metricsCount < 2) weaknesses.add("Few quantifiable achievements: Incorporate specific business impact metrics (e.g., 'reduced latency by 35%').");
        if (!missingSkills.isEmpty()) weaknesses.add("Missing high-demand skills for " + targetRole + ": " + String.join(", ", missingSkills.stream().limit(3).toList()) + ".");
        if (!hasLinkedIn || !hasGitHub) weaknesses.add("Missing direct hyperlinks to LinkedIn or GitHub portfolio profile.");
        if (wordCount < 300) weaknesses.add("Resume length is slightly brief; expand on key project challenges and solutions.");
        if (!hasSummary) weaknesses.add("Lacks a focused 2-3 line Professional Summary at the top.");
        dto.setWeaknesses(weaknesses.isEmpty() ? List.of("Consider tailoring section headers specifically to the target job description.") : weaknesses);

        // 6. Actionable Recommendations
        List<String> recommendations = new ArrayList<>();
        recommendations.add("Quantify accomplishments using the Google 'Accomplished [X], as measured by [Y], by doing [Z]' formula.");
        recommendations.add("Add missing keywords like " + (!missingSkills.isEmpty() ? missingSkills.get(0) : "Cloud platforms") + " directly into project bullet points.");
        recommendations.add("Keep section titles standard (e.g., 'Work Experience', 'Technical Skills') for optimal ATS parsing.");
        recommendations.add("Ensure bullet points lead with impactful past-tense action verbs.");
        dto.setRecommendations(recommendations);

        // 7. Section Feedback
        Map<String, String> sectionFeedback = new LinkedHashMap<>();
        sectionFeedback.put("Contact Info", hasEmail && hasPhone ? "Well-formatted. Email and phone number present." : "Make sure your email, phone, and location are prominent at the header.");
        sectionFeedback.put("Professional Summary", hasSummary ? "Included. Ensure it highlights your target role (" + targetRole + ") and key achievements." : "Add a 2-3 sentence summary summarizing your core expertise and target role.");
        sectionFeedback.put("Experience", hasExperience ? "Good structure. Focus each bullet on results and measurable outcomes rather than day-to-day duties." : "Ensure your work experience section has clear company names, titles, and dates.");
        sectionFeedback.put("Technical Skills", "Categorize skills into Languages, Frameworks, Databases, and Tools for rapid recruiter scanning.");
        sectionFeedback.put("Formatting & ATS", hasGoodLength ? "Length is well-balanced for human reading and ATS keyword scanning." : "Aim for between 400 and 800 words on a clean, single-column layout.");
        dto.setSectionFeedback(sectionFeedback);

        // 8. Tailored Interview Questions
        List<String> interviewQuestions = new ArrayList<>();
        interviewQuestions.add("Can you walk me through the architecture of the most challenging project listed on your resume?");
        interviewQuestions.add("How do you approach database performance tuning and query optimization in " + (presentSkills.contains("MySQL") ? "MySQL" : "relational databases") + "?");
        interviewQuestions.add("Describe a situation where you had to quickly learn a new technology or solve a critical production bug.");
        interviewQuestions.add("How do you ensure security and maintainability in your RESTful API endpoints?");
        interviewQuestions.add("What trade-offs did you make in your recent projects between delivery speed and system scalability?");
        dto.setInterviewQuestions(interviewQuestions);

        return dto;
    }

    private List<String> getRoleBenchmarkSkills(String targetRole) {
        String roleLower = targetRole.toLowerCase();
        if (roleLower.contains("frontend") || roleLower.contains("front end")) {
            return List.of("React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Next.js", "REST API");
        } else if (roleLower.contains("backend") || roleLower.contains("back end")) {
            return List.of("Java", "Spring Boot", "MySQL", "REST API", "Microservices", "Docker", "Git", "Unit Testing");
        } else if (roleLower.contains("full stack") || roleLower.contains("fullstack")) {
            return List.of("React", "Java", "Spring Boot", "MySQL", "JavaScript", "Docker", "REST API", "Git");
        } else if (roleLower.contains("devops") || roleLower.contains("cloud")) {
            return List.of("Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Git", "Terraform", "Python");
        } else if (roleLower.contains("data") || roleLower.contains("ai") || roleLower.contains("machine learning")) {
            return List.of("Python", "SQL", "Machine Learning", "Pandas", "Docker", "Git", "REST API");
        }
        return List.of("Java", "Spring Boot", "MySQL", "React", "REST API", "Git", "Docker");
    }

    @Transactional(readOnly = true)
    public List<AnalysisResultDto> getResumeAnalyses(UserPrincipal userPrincipal, Long resumeId) {
        // Verify ownership
        resumeRepository.findByIdAndUserId(resumeId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        return resumeAnalysisRepository.findByResumeIdOrderByCreatedAtDesc(resumeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnalysisResultDto getAnalysisById(UserPrincipal userPrincipal, Long analysisId) {
        ResumeAnalysis analysis = resumeAnalysisRepository.findByIdAndUserId(analysisId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Analysis result not found with id: " + analysisId));

        return mapToDto(analysis);
    }

    @Transactional(readOnly = true)
    public List<AnalysisResultDto> getUserRecentAnalyses(UserPrincipal userPrincipal) {
        return resumeAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId())
                .stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AnalysisResultDto mapToDto(ResumeAnalysis entity) {
        AnalysisResultDto dto = new AnalysisResultDto();
        dto.setId(entity.getId());
        dto.setResumeId(entity.getResume().getId());
        dto.setResumeTitle(entity.getResume().getTitle());
        dto.setTargetRole(entity.getTargetRole());
        dto.setJobDescription(entity.getJobDescription());
        dto.setAtsScore(entity.getAtsScore());
        dto.setMatchScore(entity.getMatchScore());
        dto.setSummary(entity.getSummary());
        dto.setModelUsed(entity.getModelUsed());
        dto.setCreatedAt(entity.getCreatedAt());

        try {
            if (entity.getPresentSkills() != null) {
                dto.setPresentSkills(objectMapper.readValue(entity.getPresentSkills(), new TypeReference<>() {}));
            }
            if (entity.getMissingSkills() != null) {
                dto.setMissingSkills(objectMapper.readValue(entity.getMissingSkills(), new TypeReference<>() {}));
            }
            if (entity.getStrengths() != null) {
                dto.setStrengths(objectMapper.readValue(entity.getStrengths(), new TypeReference<>() {}));
            }
            if (entity.getWeaknesses() != null) {
                dto.setWeaknesses(objectMapper.readValue(entity.getWeaknesses(), new TypeReference<>() {}));
            }
            if (entity.getRecommendations() != null) {
                dto.setRecommendations(objectMapper.readValue(entity.getRecommendations(), new TypeReference<>() {}));
            }
            if (entity.getSectionFeedback() != null) {
                dto.setSectionFeedback(objectMapper.readValue(entity.getSectionFeedback(), new TypeReference<>() {}));
            }
            if (entity.getInterviewQuestions() != null) {
                dto.setInterviewQuestions(objectMapper.readValue(entity.getInterviewQuestions(), new TypeReference<>() {}));
            }
        } catch (Exception e) {
            logger.warn("Could not deserialize JSON fields for analysis ID {}: {}", entity.getId(), e.getMessage());
        }

        return dto;
    }
}
