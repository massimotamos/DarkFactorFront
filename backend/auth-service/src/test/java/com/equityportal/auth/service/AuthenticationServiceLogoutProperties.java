package com.equityportal.auth.service;

// Feature: equity-trading-portal, Property 6: Logout invalidates refresh token

import com.equityportal.auth.dto.RefreshRequest;
import com.equityportal.auth.exception.InvalidRefreshTokenException;
import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import com.equityportal.persistence.repository.UserAccountRepository;
import net.jqwik.api.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Property 6: Logout invalidates refresh token
 *
 * For any authenticated user, after calling logout, attempting to use the associated refresh token
 * to obtain a new JWT should fail with InvalidRefreshTokenException.
 *
 * Validates: Requirements 1.7
 */
class AuthenticationServiceLogoutProperties {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

    @Provide
    Arbitrary<UUID> userIds() {
        return Arbitraries.randomValue(r -> UUID.randomUUID());
    }

    /**
     * Validates: Requirements 1.7
     *
     * For any arbitrary userId:
     * 1. Issue a raw refresh token via JwtService
     * 2. Set up RefreshTokenRepository mock so the first call to findByTokenHashAndRevokedFalse
     *    returns a valid non-revoked RefreshToken (consumed by logout), and the second call
     *    returns Optional.empty() (simulating the token is now revoked/not found)
     * 3. Call authService.logout(rawToken)
     * 4. Assert that calling authService.refresh(new RefreshRequest(rawToken)) throws
     *    InvalidRefreshTokenException
     */
    @Property(tries = 20)
    void logoutInvalidatesRefreshToken(@ForAll("userIds") UUID userId) {
        // Arrange: mock repositories
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);

        // Build a valid non-revoked RefreshToken for the logout call
        RefreshToken validToken = new RefreshToken();
        validToken.setId(UUID.randomUUID());
        validToken.setUserId(userId);
        validToken.setTokenHash("placeholder"); // will be overwritten by logout's sha256 lookup
        validToken.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        validToken.setRevoked(false);

        // First call (during logout) returns the valid token; second call (during refresh) returns empty
        when(refreshTokenRepository.findByTokenHashAndRevokedFalse(anyString()))
                .thenReturn(Optional.of(validToken))
                .thenReturn(Optional.empty());

        // save() returns the entity as-is
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Instantiate JwtService with test secret and mocked RefreshTokenRepository
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);

        // Instantiate AuthenticationService
        AuthenticationService authService = new AuthenticationService(
                userAccountRepository,
                refreshTokenRepository,
                jwtService,
                new BCryptPasswordEncoder(4)
        );

        // Issue a raw refresh token
        String rawToken = jwtService.issueRefreshToken(userId);

        // Act: call logout — this consumes the first mock return (Optional.of(validToken))
        authService.logout(rawToken);

        // Assert: attempting to refresh with the same token now throws InvalidRefreshTokenException
        // because the second call to findByTokenHashAndRevokedFalse returns Optional.empty()
        assertThatThrownBy(() -> authService.refresh(new RefreshRequest(rawToken)))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }
}
