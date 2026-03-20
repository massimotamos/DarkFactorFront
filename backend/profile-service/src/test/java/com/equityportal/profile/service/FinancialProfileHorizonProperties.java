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

// Feature: equity-trading-portal, Property 8: Out-of-range horizon rejected
class FinancialProfileHorizonProperties {

    private final FinancialProfileRepository repository = Mockito.mock(FinancialProfileRepository.class);
    private final FinancialProfileService service = new FinancialProfileService(repository);

    @Property(tries = 100)
    void outOfRangeHorizonIsRejected(@ForAll("outOfRangeHorizon") int horizonMonths) {
        UUID userId = UUID.randomUUID();

        FinancialProfileRequest request = new FinancialProfileRequest(
                RiskTolerance.MODERATE,
                InvestmentExperience.INTERMEDIATE,
                IncomeBracket.BETWEEN_60K_100K,
                NetWorthBand.BETWEEN_250K_1M,
                horizonMonths,
                Set.of(RegionalPreference.NORTH_AMERICA),
                new BigDecimal("8.0")
        );

        assertThatThrownBy(() -> service.createProfile(userId, request))
                .isInstanceOf(ProfileValidationException.class);
    }

    // Validates: Requirements 2.2

    @Provide
    Arbitrary<Integer> outOfRangeHorizon() {
        return Arbitraries.integers().filter(i -> i < 1 || i > 360);
    }
}
