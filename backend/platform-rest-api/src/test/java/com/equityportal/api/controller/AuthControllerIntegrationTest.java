package com.equityportal.api.controller;

import com.equityportal.api.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    @Test
    void registerAndLoginReturnsTokens() {
        // Register
        Map<String, String> regBody = Map.of("email", "it_user@example.com", "password", "SecurePass123!");
        ResponseEntity<Map> regResp = restTemplate.postForEntity("/api/auth/register", regBody, Map.class);
        assertThat(regResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(regResp.getBody()).containsKey("id");

        // Login
        Map<String, String> loginBody = Map.of("email", "it_user@example.com", "password", "SecurePass123!");
        ResponseEntity<Map> loginResp = restTemplate.postForEntity("/api/auth/login", loginBody, Map.class);
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResp.getBody()).containsKeys("accessToken", "refreshToken");
    }

    @Test
    void duplicateEmailReturns409() {
        Map<String, String> body = Map.of("email", "dup@example.com", "password", "SecurePass123!");
        restTemplate.postForEntity("/api/auth/register", body, Map.class);
        ResponseEntity<Map> resp = restTemplate.postForEntity("/api/auth/register", body, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void shortPasswordReturns400() {
        Map<String, String> body = Map.of("email", "short@example.com", "password", "short");
        ResponseEntity<Map> resp = restTemplate.postForEntity("/api/auth/register", body, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void invalidCredentialsReturn401() {
        Map<String, String> body = Map.of("email", "nobody@example.com", "password", "WrongPassword1!");
        ResponseEntity<Map> resp = restTemplate.postForEntity("/api/auth/login", body, Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void refreshAndLogout() {
        // Register + login
        Map<String, String> creds = Map.of("email", "refresh_user@example.com", "password", "SecurePass123!");
        restTemplate.postForEntity("/api/auth/register", creds, Map.class);
        ResponseEntity<Map> loginResp = restTemplate.postForEntity("/api/auth/login", creds, Map.class);
        String refreshToken = (String) loginResp.getBody().get("refreshToken");

        // Refresh
        Map<String, String> refreshBody = Map.of("refreshToken", refreshToken);
        ResponseEntity<Map> refreshResp = restTemplate.postForEntity("/api/auth/refresh", refreshBody, Map.class);
        assertThat(refreshResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshResp.getBody()).containsKey("accessToken");

        // Logout
        String newRefreshToken = (String) refreshResp.getBody().get("refreshToken");
        ResponseEntity<Void> logoutResp = restTemplate.postForEntity(
                "/api/auth/logout", Map.of("refreshToken", newRefreshToken), Void.class);
        assertThat(logoutResp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() {
        ResponseEntity<Map> resp = restTemplate.getForEntity("/api/profile", Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
