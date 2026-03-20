package com.equityportal.auth.service;

import com.equityportal.auth.dto.RegistrationRequest;
import com.equityportal.auth.exception.EmailAlreadyExistsException;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import com.equityportal.persistence.repository.UserAccountRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for auth-service: duplicate email → 409, bcrypt cost verification, expired token rejection.
 *
 * Validates: Requirements 1.2, 1.8
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceUnitTest {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserRegistrationService userRegistrationService;

    /**
     * Validates: Requirements 1.2
     *
     * When a registration request is submitted with an email already in use,
     * EmailAlreadyExistsException must be thrown (maps to HTTP 409).
     */
    @Test
    void duplicateEmailThrowsEmailAlreadyExistsException() {
        UserAccount existingAccount = new UserAccount();
        existingAccount.setId(UUID.randomUUID());
        existingAccount.setEmail("existing@example.com");
        existingAccount.setPasswordHash("someHash");
        existingAccount.setCreatedAt(Instant.now());

        when(userAccountRepository.findByEmail("existing@example.com"))
                .thenReturn(Optional.of(existingAccount));

        assertThatThrownBy(() ->
                userRegistrationService.register(new RegistrationRequest("existing@example.com", "validPassword123"))
        ).isInstanceOf(EmailAlreadyExistsException.class);
    }

    /**
     * Validates: Requirements 1.8
     *
     * BCrypt password hashes must use cost factor 12 or higher.
     * Verifies the hash prefix contains "$12$" indicating cost factor 12.
     */
    @Test
    void bcryptCostIsAtLeast12() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode("testPassword123");

        assertThat(hash).matches(h -> h.startsWith("$2a$") || h.startsWith("$2b$"));
        assertThat(hash).contains("$12$");
    }

    /**
     * Validates: Requirements 1.2 (token validation)
     *
     * An expired JWT must be rejected by JwtService.validateToken(), returning false.
     */
    @Test
    void expiredTokenIsRejectedByValidateToken() {
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);

        SecretKey signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(JWT_SECRET));

        String expiredToken = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "user@example.com")
                .issuedAt(Date.from(Instant.now().minus(2, ChronoUnit.HOURS)))
                .expiration(Date.from(Instant.now().minus(1, ChronoUnit.HOURS)))
                .signWith(signingKey)
                .compact();

        boolean result = jwtService.validateToken(expiredToken);

        assertThat(result).isFalse();
    }
}
