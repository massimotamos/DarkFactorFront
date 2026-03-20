package com.equityportal.profile.service;

import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.profile.dto.FinancialProfileRequest;
import com.equityportal.profile.exception.ProfileValidationException;
import net.jqwik.api.*;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Feature: equity-trading-portal, Property 9: Out-of-range ROI rejected
class FinancialProfileRoiProperties {

    private final FinancialProfileRepository repository = Mockito.mock(FinancialProfileRepository.class);
    private final FinancialProfileService service = new FinancialProfileService(repository);

    @Property(tries = 100)
    void outOfRangeRoiIsRejected(@ForAll("outOfRangeRoi") BigDecimal targetRoiPercent) {
        UUID userId = UUID.randomUUID();

        FinancialProfileRequest request = new FinancialProfileRequest(
                RiskTolerance.MODERATE,
                InvestmentExperience.INTERMEDIATE,
                IncomeBracket.BETWEEN_60K_100K,
                NetWorthBand.BETWEEN_250K_1M,
                24,
                Set.of(RegionalPreference.NORTH_AMERICA),
                targetRoiPercent
        );

        assertThatThrownBy(() -> service.createProfile(userId, request))
                .isInstanceOf(ProfileValidationException.class);
    }

    // Validates: Requirements 2.3

    @Provide
    Arbitrary<BigDecimal> outOfRangeRoi() {
        // Generate doubles strictly outside [0.1, 50.0], then convert to BigDecimal
        Arbitrary<BigDecimal> belowMin = Arbitraries.doubles()
                .between(-1000.0, 0.09)
                .map(BigDecimal::valueOf);
        Arbitrary<BigDecimal> aboveMax = Arbitraries.doubles()
                .between(50.01, 1000.0)
                .map(BigDecimal::valueOf);
        return Arbitraries.oneOf(belowMin, aboveMax);
    }
}
