package com.equityportal.auth.service;

// Feature: equity-trading-portal, Property 5: Invalid credentials return generic 401

import com.equityportal.auth.dto.LoginRequest;
import com.equityportal.auth.exception.InvalidCredentialsException;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import com.equityportal.persistence.repository.UserAccountRepository;
import net.jqwik.api.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Property 5: Invalid credentials return generic 401
 *
 * For any combination of email and password where at least one is incorrect, the Auth_Service
 * should return HTTP 401 with a message that does not distinguish between wrong email and wrong
 * password. At the service layer: should throw InvalidCredentialsException with a generic message.
 *
 * Validates: Requirements 1.6
 */
class AuthenticationServiceInvalidCredentialsProperties {

    private static final String JWT_SECRET =
            "dGhpcyBpcyBhIHZlcnkgbG9uZyBzZWNyZXQga2V5IGZvciBqd3QgdGVzdGluZyBwdXJwb3Nlcw==";

    private static final String CORRECT_PASSWORD = "correctPassword123";

    /**
     * Pre-computed bcrypt hash of CORRECT_PASSWORD at cost 4 (fast for tests).
     * Stored once to avoid re-hashing on every property iteration.
     */
    private static final String CORRECT_PASSWORD_HASH =
            new BCryptPasswordEncoder(4).encode(CORRECT_PASSWORD);

    private static final String GENERIC_ERROR_MESSAGE = "Invalid email or password";

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    @Provide
    Arbitrary<String> anyEmails() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(1)
                .ofMaxLength(64)
                .map(s -> s + "@example.com");
    }

    /**
     * Generates passwords that are NOT the correct password, ensuring the wrong-password scenario.
     */
    @Provide
    Arbitrary<String> wrongPasswords() {
        return Arbitraries.strings()
                .ofMinLength(1)
                .ofMaxLength(128)
                .filter(p -> !CORRECT_PASSWORD.equals(p));
    }

    // -------------------------------------------------------------------------
    // Scenario 1: Wrong email (user not found)
    // -------------------------------------------------------------------------

    /**
     * Validates: Requirements 1.6
     *
     * For any email, when the repository returns Optional.empty() (user not found),
     * AuthenticationService.login() must throw InvalidCredentialsException with the
     * generic message "Invalid email or password".
     */
    @Property(tries = 50)
    void wrongEmailThrowsGenericInvalidCredentials(@ForAll("anyEmails") String email) {
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);

        // User not found for any email
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        AuthenticationService authService = buildAuthService(userAccountRepository, refreshTokenRepository);

        assertThatThrownBy(() -> authService.login(new LoginRequest(email, "anyPassword")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage(GENERIC_ERROR_MESSAGE);
    }

    // -------------------------------------------------------------------------
    // Scenario 2: Wrong password (user found but password doesn't match)
    // -------------------------------------------------------------------------

    /**
     * Validates: Requirements 1.6
     *
     * For any password that is NOT the correct password, when the repository returns a UserAccount
     * with the known bcrypt hash of CORRECT_PASSWORD, AuthenticationService.login() must throw
     * InvalidCredentialsException with the same generic message "Invalid email or password".
     *
     * This ensures the error message does not reveal which field was wrong.
     */
    @Property(tries = 50)
    void wrongPasswordThrowsGenericInvalidCredentials(@ForAll("wrongPasswords") String wrongPassword) {
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);

        // Build a UserAccount whose passwordHash is the bcrypt hash of CORRECT_PASSWORD
        UserAccount userAccount = new UserAccount();
        userAccount.setId(UUID.randomUUID());
        userAccount.setEmail("user@example.com");
        userAccount.setPasswordHash(CORRECT_PASSWORD_HASH);
        userAccount.setCreatedAt(Instant.now());

        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));

        AuthenticationService authService = buildAuthService(userAccountRepository, refreshTokenRepository);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user@example.com", wrongPassword)))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage(GENERIC_ERROR_MESSAGE);
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private AuthenticationService buildAuthService(
            UserAccountRepository userAccountRepository,
            RefreshTokenRepository refreshTokenRepository) {
        JwtService jwtService = new JwtService(JWT_SECRET, refreshTokenRepository);
        return new AuthenticationService(
                userAccountRepository,
                refreshTokenRepository,
                jwtService,
                new BCryptPasswordEncoder(4)
        );
    }
}
