package com.equityportal.api.controller;

import com.equityportal.persistence.entity.FinancialProfile;
import com.equityportal.profile.dto.FinancialProfileRequest;
import com.equityportal.profile.dto.FinancialProfileResponse;
import com.equityportal.profile.service.FinancialProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final FinancialProfileService profileService;

    public ProfileController(FinancialProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<FinancialProfileResponse> createProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody @Valid FinancialProfileRequest request) {
        FinancialProfile profile = profileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(profile));
    }

    @PutMapping
    public ResponseEntity<FinancialProfileResponse> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody @Valid FinancialProfileRequest request) {
        FinancialProfile profile = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(toResponse(profile));
    }

    @GetMapping
    public ResponseEntity<FinancialProfileResponse> getProfile(
            @AuthenticationPrincipal UUID userId) {
        FinancialProfile profile = profileService.getProfile(userId);
        return ResponseEntity.ok(toResponse(profile));
    }

    private FinancialProfileResponse toResponse(FinancialProfile p) {
        return new FinancialProfileResponse(
                p.getId(),
                p.getRiskTolerance(),
                p.getExperience(),
                p.getIncomeBracket(),
                p.getNetWorthBand(),
                p.getHorizonMonths(),
                p.getRegions(),
                p.getTargetRoiPercent(),
                p.getUpdatedAt()
        );
    }
}
