package com.equityportal.auth.service;

import com.equityportal.auth.dto.AuthTokens;
import com.equityportal.auth.dto.LoginRequest;
import com.equityportal.auth.dto.RefreshRequest;
import com.equityportal.auth.exception.InvalidCredentialsException;
import com.equityportal.auth.exception.InvalidRefreshTokenException;
import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import com.equityportal.persistence.repository.UserAccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class AuthenticationService {

    private final UserAccountRepository userAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthenticationService(UserAccountRepository userAccountRepository,
                                 RefreshTokenRepository refreshTokenRepository,
                                 JwtService jwtService,
                                 BCryptPasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthTokens login(LoginRequest request) {
        UserAccount account = userAccountRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.issueAccessToken(account.getId(), account.getEmail());
        String refreshToken = jwtService.issueRefreshToken(account.getId());
        return new AuthTokens(accessToken, refreshToken);
    }

    public AuthTokens refresh(RefreshRequest request) {
        if (request.refreshToken() == null || request.refreshToken().isBlank()) {
            throw new InvalidRefreshTokenException();
        }
        String tokenHash = sha256Hex(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException();
        }

        UserAccount account = userAccountRepository.findById(stored.getUserId())
                .orElseThrow(InvalidRefreshTokenException::new);

        String newAccessToken = jwtService.issueAccessToken(account.getId(), account.getEmail());
        String newRefreshToken = jwtService.issueRefreshToken(account.getId());

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return new AuthTokens(newAccessToken, newRefreshToken);
    }

    public void logout(String rawRefreshToken) {
        String tokenHash = sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

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
