package com.equityportal.api.controller;

import com.equityportal.api.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    TestRestTemplate restTemplate;

    private String accessToken;

    @BeforeEach
    void setUp() {
        Map<String, String> creds = Map.of("email", "profile_it@example.com", "password", "SecurePass123!");
        restTemplate.postForEntity("/api/auth/register", creds, Map.class);
        ResponseEntity<Map> loginResp = restTemplate.postForEntity("/api/auth/login", creds, Map.class);
        accessToken = (String) loginResp.getBody().get("accessToken");
    }

    @Test
    void createAndGetProfile() {
        Map<String, Object> profileBody = Map.of(
                "riskTolerance", "MODERATE",
                "experience", "INTERMEDIATE",
                "incomeBracket", "BRACKET_50K_100K",
                "netWorthBand", "BAND_100K_500K",
                "horizonMonths", 60,
                "regions", java.util.List.of("NORTH_AMERICA"),
                "targetRoiPercent", "8.5"
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> createResp = restTemplate.exchange(
                "/api/profile", HttpMethod.POST,
                new HttpEntity<>(profileBody, headers), Map.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).containsKey("id");

        ResponseEntity<Map> getResp = restTemplate.exchange(
                "/api/profile", HttpMethod.GET,
                new HttpEntity<>(headers), Map.class);
        assertThat(getResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResp.getBody().get("riskTolerance")).isEqualTo("MODERATE");
    }

    @Test
    void invalidHorizonReturns400() {
        Map<String, Object> profileBody = Map.of(
                "riskTolerance", "MODERATE",
                "experience", "INTERMEDIATE",
                "incomeBracket", "BRACKET_50K_100K",
                "netWorthBand", "BAND_100K_500K",
                "horizonMonths", 999,
                "regions", java.util.List.of("NORTH_AMERICA"),
                "targetRoiPercent", "8.5"
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> resp = restTemplate.exchange(
                "/api/profile", HttpMethod.POST,
                new HttpEntity<>(profileBody, headers), Map.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
