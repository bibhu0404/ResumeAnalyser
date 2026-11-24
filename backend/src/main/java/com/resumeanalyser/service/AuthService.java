package com.resumeanalyser.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyser.dto.*;
import com.resumeanalyser.exception.BadRequestException;
import com.resumeanalyser.exception.ResourceNotFoundException;
import com.resumeanalyser.model.AuthProvider;
import com.resumeanalyser.model.Role;
import com.resumeanalyser.model.User;
import com.resumeanalyser.repository.UserRepository;
import com.resumeanalyser.security.JwtTokenProvider;
import com.resumeanalyser.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.restClient = RestClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setFullName(request.getFullName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(Role.ROLE_USER);

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), user.getFullName());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPictureUrl()
        );
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getPictureUrl()
        );
    }

    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        try {
            // Verify Google ID token via Google TokenInfo API
            String response = restClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token={token}", request.getIdToken())
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);

            if (node.has("error_description")) {
                throw new BadRequestException("Invalid Google token: " + node.get("error_description").asText());
            }

            String email = node.path("email").asText();
            String name = node.path("name").asText(email.split("@")[0]);
            String picture = node.path("picture").asText(null);

            if (email == null || email.isBlank()) {
                throw new BadRequestException("Could not retrieve email from Google token.");
            }

            final String cleanEmail = email.toLowerCase().trim();

            User user = userRepository.findByEmail(cleanEmail)
                    .map(existingUser -> {
                        if (picture != null) {
                            existingUser.setPictureUrl(picture);
                        }
                        if (existingUser.getFullName() == null || existingUser.getFullName().isBlank()) {
                            existingUser.setFullName(name);
                        }
                        return userRepository.save(existingUser);
                    })
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(cleanEmail);
                        newUser.setFullName(name);
                        newUser.setPictureUrl(picture);
                        newUser.setProvider(AuthProvider.GOOGLE);
                        newUser.setRole(Role.ROLE_USER);
                        // Generate a secure random password for OAuth users
                        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                        return userRepository.save(newUser);
                    });

            String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), user.getFullName());

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getPictureUrl()
            );

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Google authentication failed", e);
            throw new BadRequestException("Google sign in failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getProvider().name(),
                user.getRole().name(),
                user.getPictureUrl()
        );
    }
}
