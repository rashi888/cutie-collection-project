package com.cutie.collection.backend.dto;

import com.cutie.collection.backend.entity.Role;

public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private Long expiresIn;

    private Long userId;
    private String name;
    private String email;
    private Role role;

    private String message;

    public AuthResponse() {
        this.tokenType = "Bearer";
    }

    public AuthResponse(
            String accessToken,
            Long expiresIn,
            Long userId,
            String name,
            String email,
            Role role,
            String message) {

        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {

        if (tokenType == null || tokenType.isBlank()) {
            this.tokenType = "Bearer";
            return;
        }

        this.tokenType = tokenType.trim();
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {

        if (expiresIn != null && expiresIn <= 0) {
            throw new IllegalArgumentException(
                    "Token expiration must be greater than zero");
        }

        this.expiresIn = expiresIn;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {

        this.name = name == null
                ? null
                : name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {

        this.email = email == null
                ? null
                : email.trim().toLowerCase();
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {

        this.message = message == null
                ? null
                : message.trim();
    }
}