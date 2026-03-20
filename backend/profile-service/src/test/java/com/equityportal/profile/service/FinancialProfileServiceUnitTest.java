package com.equityportal.profile.service;

import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.profile.dto.FinancialProfileRequest;
import com.equityportal.profile.exception.ProfileValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Validates: Requirements 2.4, 2.5, 2.7
@ExtendWith(MockitoExtension.class)
class FinancialProfileServiceUnitTest {

    @Mock
    private FinancialProfileRepository repository;

    @InjectMocks
    private FinancialProfileService service;

    @Test
    void emptyRegionsThrowsValidationException() {
        UUID userId = UUID.randomUUID();
        FinancialProfileRequest request = new FinancialProfileRequest(
                RiskTolerance.MODERATE,
                InvestmentExperience.INTERMEDIATE,
                IncomeBracket.BETWEEN_60K_100K,
                NetWorthBand.BETWEEN_250K_1M,
                24,
                Collections.emptySet(),
                new BigDecimal("8.0")
        );

        assertThatThrownBy(() -> service.createProfile(userId, request))
                .isInstanceOf(ProfileValidationException.class);
    }

    @Test
    void missingRequiredFieldThrowsValidationException() {
        UUID userId = UUID.randomUUID();
        FinancialProfileRequest request = new FinancialProfileRequest(
                null, // null riskTolerance
                InvestmentExperience.INTERMEDIATE,
                IncomeBracket.BETWEEN_60K_100K,
                NetWorthBand.BETWEEN_250K_1M,
                24,
                Set.of(RegionalPreference.NORTH_AMERICA),
                new BigDecimal("8.0")
        );

        assertThatThrownBy(() -> service.createProfile(userId, request))
                .isInstanceOf(ProfileValidationException.class);
    }

    @Test
    void updateReplacesExistingRecord() {
        UUID userId = UUID.randomUUID();

        FinancialProfile existing = new FinancialProfile();
        existing.setUserId(userId);
        existing.setRiskTolerance(RiskTolerance.CONSERVATIVE);
        existing.setExperience(InvestmentExperience.BEGINNER);
        existing.setIncomeBracket(IncomeBracket.UNDER_30K);
        existing.setNetWorthBand(NetWorthBand.UNDER_50K);
        existing.setHorizonMonths(12);
        existing.setRegions(Set.of(RegionalPreference.EUROPE));
        existing.setTargetRoiPercent(new BigDecimal("2.0"));
        existing.setUpdatedAt(Instant.now());

        when(repository.findByUserId(userId)).thenReturn(Optional.of(existing));
        when(repository.save(any(FinancialProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        FinancialProfileRequest updatedRequest = new FinancialProfileRequest(
                RiskTolerance.AGGRESSIVE,
                InvestmentExperience.ADVANCED,
                IncomeBracket.OVER_200K,
                NetWorthBand.OVER_5M,
                120,
                Set.of(RegionalPreference.NORTH_AMERICA),
                new BigDecimal("15.0")
        );

        service.updateProfile(userId, updatedRequest);

        ArgumentCaptor<FinancialProfile> captor = ArgumentCaptor.forClass(FinancialProfile.class);
        verify(repository).save(captor.capture());

        FinancialProfile saved = captor.getValue();
        assertThat(saved.getRiskTolerance()).isEqualTo(RiskTolerance.AGGRESSIVE);
        assertThat(saved.getExperience()).isEqualTo(InvestmentExperience.ADVANCED);
        assertThat(saved.getIncomeBracket()).isEqualTo(IncomeBracket.OVER_200K);
        assertThat(saved.getNetWorthBand()).isEqualTo(NetWorthBand.OVER_5M);
        assertThat(saved.getHorizonMonths()).isEqualTo(120);
        assertThat(saved.getRegions()).containsExactly(RegionalPreference.NORTH_AMERICA);
        assertThat(saved.getTargetRoiPercent()).isEqualByComparingTo(new BigDecimal("15.0"));
    }
}
