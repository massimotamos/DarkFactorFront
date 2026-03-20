package com.equityportal.profile.service;

import com.equityportal.persistence.entity.FinancialProfile;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.profile.dto.FinancialProfileRequest;
import com.equityportal.profile.exception.ProfileNotFoundException;
import com.equityportal.profile.exception.ProfileValidationException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class FinancialProfileService {

    private static final BigDecimal ROI_MIN = new BigDecimal("0.1");
    private static final BigDecimal ROI_MAX = new BigDecimal("50.0");

    private final FinancialProfileRepository repository;

    public FinancialProfileService(FinancialProfileRepository repository) {
        this.repository = repository;
    }

    public FinancialProfile createProfile(UUID userId, FinancialProfileRequest request) {
        validate(request);

        FinancialProfile profile = new FinancialProfile();
        profile.setUserId(userId);
        applyFields(profile, request);
        profile.setUpdatedAt(Instant.now());

        return repository.save(profile);
    }

    public FinancialProfile updateProfile(UUID userId, FinancialProfileRequest request) {
        FinancialProfile profile = repository.findByUserId(userId)
                .orElseThrow(ProfileNotFoundException::new);

        validate(request);

        applyFields(profile, request);
        profile.setUpdatedAt(Instant.now());

        return repository.save(profile);
    }

    public FinancialProfile getProfile(UUID userId) {
        return repository.findByUserId(userId)
                .orElseThrow(ProfileNotFoundException::new);
    }

    private void validate(FinancialProfileRequest request) {
        if (request.riskTolerance() == null
                || request.experience() == null
                || request.incomeBracket() == null
                || request.netWorthBand() == null) {
            throw new ProfileValidationException("All required fields must be present");
        }

        if (request.horizonMonths() < 1 || request.horizonMonths() > 360) {
            throw new ProfileValidationException("horizonMonths must be between 1 and 360");
        }

        if (request.targetRoiPercent() == null
                || request.targetRoiPercent().compareTo(ROI_MIN) < 0
                || request.targetRoiPercent().compareTo(ROI_MAX) > 0) {
            throw new ProfileValidationException("targetRoiPercent must be between 0.1 and 50.0");
        }

        if (request.regions() == null || request.regions().isEmpty()) {
            throw new ProfileValidationException("At least one region must be selected");
        }
    }

    private void applyFields(FinancialProfile profile, FinancialProfileRequest request) {
        profile.setRiskTolerance(request.riskTolerance());
        profile.setExperience(request.experience());
        profile.setIncomeBracket(request.incomeBracket());
        profile.setNetWorthBand(request.netWorthBand());
        profile.setHorizonMonths(request.horizonMonths());
        profile.setRegions(request.regions());
        profile.setTargetRoiPercent(request.targetRoiPercent());
    }
}
