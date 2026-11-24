package com.resumeanalyser.dto;

public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String provider;
    private String role;
    private String pictureUrl;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, String fullName, String provider, String role, String pictureUrl) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.provider = provider;
        this.role = role;
        this.pictureUrl = pictureUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }
}
