package com.equityportal.auth.service;

import com.equityportal.persistence.entity.RefreshToken;
import com.equityportal.persistence.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_MINUTES = 60L;
    private static final long REFRESH_TOKEN_DAYS = 7L;

    private final SecretKey signingKey;
    private final RefreshTokenRepository refreshTokenRepository;

    public JwtService(@Value("${jwt.secret}") String secret,
                      RefreshTokenRepository refreshTokenRepository) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String issueAccessToken(UUID userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ACCESS_TOKEN_MINUTES, ChronoUnit.MINUTES)))
                .signWith(signingKey)
                .compact();
    }

    public String issueRefreshToken(UUID userId) {
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = sha256Hex(rawToken);

        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(tokenHash);
        entity.setExpiresAt(Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        return rawToken;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
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
