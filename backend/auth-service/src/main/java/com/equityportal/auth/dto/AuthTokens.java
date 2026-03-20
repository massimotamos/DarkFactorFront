package com.equityportal.auth.dto;

public record AuthTokens(String accessToken, String refreshToken, long expiresIn) {

    public AuthTokens(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, 3600L);
    }
}
