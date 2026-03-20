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

// Feature: equity-trading-portal, Property 10: Missing required profile fields rejected
class FinancialProfileMissingFieldsProperties {

    private final FinancialProfileRepository repository = Mockito.mock(FinancialProfileRepository.class);
    private final FinancialProfileService service = new FinancialProfileService(repository);

    @Property(tries = 50)
    void missingRequiredFieldIsRejected(@ForAll("fieldIndex") int fieldIndex) {
        UUID userId = UUID.randomUUID();

        // Build a request with one required enum field nulled out based on fieldIndex
        RiskTolerance riskTolerance = fieldIndex == 0 ? null : RiskTolerance.MODERATE;
        InvestmentExperience experience = fieldIndex == 1 ? null : InvestmentExperience.INTERMEDIATE;
        IncomeBracket incomeBracket = fieldIndex == 2 ? null : IncomeBracket.BETWEEN_60K_100K;
        NetWorthBand netWorthBand = fieldIndex == 3 ? null : NetWorthBand.BETWEEN_250K_1M;

        FinancialProfileRequest request = new FinancialProfileRequest(
                riskTolerance,
                experience,
                incomeBracket,
                netWorthBand,
                24,
                Set.of(RegionalPreference.NORTH_AMERICA),
                new BigDecimal("8.0")
        );

        assertThatThrownBy(() -> service.createProfile(userId, request))
                .isInstanceOf(ProfileValidationException.class);
    }

    // Validates: Requirements 2.7

    @Provide
    Arbitrary<Integer> fieldIndex() {
        return Arbitraries.integers().between(0, 3);
    }
}
