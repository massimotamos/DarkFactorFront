package com.equityportal.api.controller;

import com.equityportal.auth.dto.AuthTokens;
import com.equityportal.auth.dto.LoginRequest;
import com.equityportal.auth.dto.RefreshRequest;
import com.equityportal.auth.dto.RegistrationRequest;
import com.equityportal.auth.service.AuthenticationService;
import com.equityportal.auth.service.UserRegistrationService;
import com.equityportal.persistence.entity.UserAccount;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRegistrationService registrationService;
    private final AuthenticationService authenticationService;

    public AuthController(UserRegistrationService registrationService,
                          AuthenticationService authenticationService) {
        this.registrationService = registrationService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody @Valid RegistrationRequest request) {
        UserAccount account = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("id", account.getId(), "email", account.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthTokens> login(@RequestBody @Valid LoginRequest request) {
        AuthTokens tokens = authenticationService.login(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokens> refresh(@RequestBody @Valid RefreshRequest request) {
        AuthTokens tokens = authenticationService.refresh(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid RefreshRequest request) {
        authenticationService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
