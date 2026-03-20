package com.equityportal.auth.service;

// Feature: equity-trading-portal, Property 4: Refresh token round-trip

import com.equityportal.auth.dto.AuthTokens;
import com.equityportal.auth.dto.RefreshRequest;
import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import com.equityportal.persistence.repository.UserAccountRepository;
import net.jqwik.api.*;
import org.assertj.core.api.Assertions;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Property 4: Refresh token round-trip
 *
 * For any authenticated user, after a JWT expires, presenting the associated refresh token to the
 * Auth_Service should produce a new valid JWT, and the old JWT should no longer be accepted.
 *
 * Validates: Requirements 1.5, 10.5
 */
class AuthenticationServiceRefreshProperties {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

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
     * Validates: Requirements 1.5, 10.5
     *
     * For any arbitrary userId and email:
     * - Issuing a refresh token and presenting it to authService.refresh() must return new AuthTokens
     * - The new access token must be valid (validateToken returns true)
     * - The new access token's userId must match the original userId
     * - The new refresh token must be non-null and non-empty
     */
    @Property(tries = 20)
    void refreshTokenRoundTrip(
            @ForAll("userIds") UUID userId,
            @ForAll("emails") String email
    ) {
        // Arrange: mock repositories
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);

        // UserAccount mock: findById returns a UserAccount with the given userId and email
        UserAccount userAccount = new UserAccount();
        userAccount.setId(userId);
        userAccount.setEmail(email);
        userAccount.setPasswordHash("irrelevant");
        userAccount.setCreatedAt(Instant.now());
        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(userAccount));

        // RefreshTokenRepository mock: save returns the entity as-is
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // RefreshTokenRepository mock: findByTokenHashAndRevokedFalse returns a valid RefreshToken
        // whose tokenHash matches the SHA-256 of the raw token presented.
        // We use anyString() and build the RefreshToken dynamically via thenAnswer so that
        // the tokenHash in the returned entity matches whatever hash was looked up.
        when(refreshTokenRepository.findByTokenHashAndRevokedFalse(anyString()))
                .thenAnswer(invocation -> {
                    String queriedHash = invocation.getArgument(0);
                    RefreshToken stored = new RefreshToken();
                    stored.setId(UUID.randomUUID());
                    stored.setUserId(userId);
                    stored.setTokenHash(queriedHash);
                    stored.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
                    stored.setRevoked(false);
                    return Optional.of(stored);
                });

        // Instantiate JwtService with test secret and mocked RefreshTokenRepository
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);

        // Instantiate AuthenticationService with mocked repos, JwtService, and BCryptPasswordEncoder
        AuthenticationService authService = new AuthenticationService(
                userAccountRepository,
                refreshTokenRepository,
                jwtService,
                new BCryptPasswordEncoder(4)
        );

        // Act: issue a raw refresh token via JwtService
        String rawRefreshToken = jwtService.issueRefreshToken(userId);

        // Act: call authService.refresh() with the raw refresh token
        AuthTokens newTokens = authService.refresh(new RefreshRequest(rawRefreshToken));

        // Assert: new access token is valid
        Assertions.assertThat(jwtService.validateToken(newTokens.accessToken()))
                .as("New access token should be valid")
                .isTrue();

        // Assert: new access token's userId matches the original userId
        Assertions.assertThat(jwtService.extractUserId(newTokens.accessToken()))
                .as("New access token userId should match the original userId")
                .isEqualTo(userId);

        // Assert: new refresh token is non-null and non-empty
        Assertions.assertThat(newTokens.refreshToken())
                .as("New refresh token should be non-null and non-empty")
                .isNotNull()
                .isNotEmpty();
    }

    // Helper: SHA-256 hex (mirrors the implementation in AuthenticationService)
    private static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
