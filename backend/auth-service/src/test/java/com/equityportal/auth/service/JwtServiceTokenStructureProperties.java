package com.equityportal.auth.service;

import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Feature: equity-trading-portal, Property 3: Login returns correctly structured tokens
@ExtendWith(MockitoExtension.class)
class JwtServiceTokenStructureProperties {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

    private static final long TOLERANCE_SECONDS = 5L;

    /**
     * Validates: Requirements 1.4
     *
     * For any registered user, submitting valid credentials should return a JWT with an `exp`
     * claim of exactly 60 minutes from issuance and a refresh token with an expiry of exactly
     * 7 days.
     */
    @Property(tries = 50)
    void loginReturnsCorrectlyStructuredTokens(
            @ForAll @StringLength(min = 1, max = 64) String email
    ) {
        UUID userId = UUID.randomUUID();

        // Set up mocked repository
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Instantiate JwtService directly with the known secret and mocked repository
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);

        // --- Access token ---
        Instant beforeIssue = Instant.now();
        String accessToken = jwtService.issueAccessToken(userId, email);
        Instant afterIssue = Instant.now();

        // Parse the JWT using the same secret key
        SecretKey signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(JWT_SECRET));
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(accessToken)
                .getPayload();

        // Verify `sub` claim equals userId.toString()
        assertThat(claims.getSubject()).isEqualTo(userId.toString());

        // Verify `email` claim equals the generated email
        assertThat(claims.get("email", String.class)).isEqualTo(email);

        // Verify `iat` claim is approximately now (within 5-second tolerance)
        Date issuedAt = claims.getIssuedAt();
        assertThat(issuedAt.toInstant())
                .isAfterOrEqualTo(beforeIssue.minusSeconds(TOLERANCE_SECONDS))
                .isBeforeOrEqualTo(afterIssue.plusSeconds(TOLERANCE_SECONDS));

        // Verify `exp` claim is approximately 60 minutes from now (within 5-second tolerance)
        Date expiration = claims.getExpiration();
        Instant expectedExpLow  = beforeIssue.plus(60, ChronoUnit.MINUTES).minusSeconds(TOLERANCE_SECONDS);
        Instant expectedExpHigh = afterIssue.plus(60, ChronoUnit.MINUTES).plusSeconds(TOLERANCE_SECONDS);
        assertThat(expiration.toInstant())
                .isAfterOrEqualTo(expectedExpLow)
                .isBeforeOrEqualTo(expectedExpHigh);

        // --- Refresh token ---
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        when(refreshTokenRepository.save(captor.capture()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Instant beforeRefresh = Instant.now();
        String rawRefreshToken = jwtService.issueRefreshToken(userId);
        Instant afterRefresh = Instant.now();

        // Verify raw token is not null and not empty
        assertThat(rawRefreshToken).isNotNull().isNotEmpty();

        // Verify the saved RefreshToken has expiresAt approximately 7 days from now
        RefreshToken savedEntity = captor.getValue();
        Instant expectedExpiryLow  = beforeRefresh.plus(7, ChronoUnit.DAYS).minusSeconds(TOLERANCE_SECONDS);
        Instant expectedExpiryHigh = afterRefresh.plus(7, ChronoUnit.DAYS).plusSeconds(TOLERANCE_SECONDS);
        assertThat(savedEntity.getExpiresAt())
                .isAfterOrEqualTo(expectedExpiryLow)
                .isBeforeOrEqualTo(expectedExpiryHigh);
    }
}
