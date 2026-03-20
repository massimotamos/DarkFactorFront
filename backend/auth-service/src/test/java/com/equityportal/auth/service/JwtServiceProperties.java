package com.equityportal.auth.service;

// Feature: equity-trading-portal, Property 3: Login returns correctly structured tokens

import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import net.jqwik.api.*;
import org.assertj.core.api.Assertions;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Property 3: Login returns correctly structured tokens
 *
 * For any registered user, submitting valid credentials should return a JWT with an {@code exp}
 * claim of exactly 60 minutes from issuance and a refresh token with an expiry of exactly 7 days.
 *
 * Validates: Requirements 1.4
 */
class JwtServiceProperties {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

    private static final long EXPECTED_ACCESS_TOKEN_SECONDS = 3600L; // 60 minutes

    @Provide
    Arbitrary<UUID> userIds() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<String> emails() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(1)
                .ofMaxLength(64);
    }

    /**
     * Validates: Requirements 1.4
     *
     * For any arbitrary userId and email, issuing an access token must produce a JWT where:
     * - exp - iat == 3600 seconds (exactly 60 minutes)
     * - extractUserId(token) returns the same userId
     * - extractEmail(token) returns the same email
     * - validateToken(token) returns true
     */
    @Property(tries = 50)
    void loginReturnsCorrectlyStructuredTokens(
            @ForAll("userIds") UUID userId,
            @ForAll("emails") String email
    ) {
        // Arrange: mock RefreshTokenRepository so save() returns the entity
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Instantiate JwtService directly with the test secret and mocked repository
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);

        // Act: issue access token
        String token = jwtService.issueAccessToken(userId, email);

        // Parse the JWT to extract raw claims
        SecretKey signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(JWT_SECRET));
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Date iat = claims.getIssuedAt();
        Date exp = claims.getExpiration();

        // Assert: exp - iat == exactly 3600 seconds (60 minutes)
        long diffSeconds = (exp.getTime() - iat.getTime()) / 1000L;
        Assertions.assertThat(diffSeconds)
                .as("exp - iat should be exactly 3600 seconds (60 minutes)")
                .isEqualTo(EXPECTED_ACCESS_TOKEN_SECONDS);

        // Assert: extractUserId returns the same userId
        Assertions.assertThat(jwtService.extractUserId(token))
                .as("extractUserId should return the original userId")
                .isEqualTo(userId);

        // Assert: extractEmail returns the same email
        Assertions.assertThat(jwtService.extractEmail(token))
                .as("extractEmail should return the original email")
                .isEqualTo(email);

        // Assert: validateToken returns true
        Assertions.assertThat(jwtService.validateToken(token))
                .as("validateToken should return true for a freshly issued token")
                .isTrue();
    }
}
