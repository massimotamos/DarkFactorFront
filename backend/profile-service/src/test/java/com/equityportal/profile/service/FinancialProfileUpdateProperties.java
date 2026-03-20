package com.equityportal.profile.service;

import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.profile.dto.FinancialProfileRequest;
import net.jqwik.api.*;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Feature: equity-trading-portal, Property 11: Profile update round-trip
class FinancialProfileUpdateProperties {

    private final FinancialProfileRepository repository = Mockito.mock(FinancialProfileRepository.class);
    private final FinancialProfileService service = new FinancialProfileService(repository);

    @Property(tries = 30)
    void profileUpdateReturnsUpdatedValues(
            @ForAll("originalRequest") FinancialProfileRequest original,
            @ForAll("updatedRequest") FinancialProfileRequest updated
    ) {
        UUID userId = UUID.randomUUID();

        // Build an existing entity from the original request
        FinancialProfile existingEntity = buildEntity(userId, original);

        Mockito.when(repository.findByUserId(userId)).thenReturn(Optional.of(existingEntity));
        // save returns the entity as-is (the service mutates it in place)
        Mockito.when(repository.save(Mockito.any(FinancialProfile.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        FinancialProfile result = service.updateProfile(userId, updated);

        assertThat(result.getRiskTolerance()).isEqualTo(updated.riskTolerance());
        assertThat(result.getExperience()).isEqualTo(updated.experience());
        assertThat(result.getIncomeBracket()).isEqualTo(updated.incomeBracket());
        assertThat(result.getNetWorthBand()).isEqualTo(updated.netWorthBand());
        assertThat(result.getHorizonMonths()).isEqualTo(updated.horizonMonths());
        assertThat(result.getRegions()).containsExactlyInAnyOrderElementsOf(updated.regions());
        assertThat(result.getTargetRoiPercent()).isEqualByComparingTo(updated.targetRoiPercent());
    }

    // Validates: Requirements 2.5, 2.6

    private FinancialProfile buildEntity(UUID userId, FinancialProfileRequest request) {
        FinancialProfile p = new FinancialProfile();
        p.setUserId(userId);
        p.setRiskTolerance(request.riskTolerance());
        p.setExperience(request.experience());
        p.setIncomeBracket(request.incomeBracket());
        p.setNetWorthBand(request.netWorthBand());
        p.setHorizonMonths(request.horizonMonths());
        p.setRegions(request.regions());
        p.setTargetRoiPercent(request.targetRoiPercent());
        p.setUpdatedAt(Instant.now());
        return p;
    }

    @Provide
    Arbitrary<FinancialProfileRequest> originalRequest() {
        return validRequest();
    }

    @Provide
    Arbitrary<FinancialProfileRequest> updatedRequest() {
        return validRequest();
    }

    private Arbitrary<FinancialProfileRequest> validRequest() {
        Arbitrary<RiskTolerance> risk = Arbitraries.of(RiskTolerance.values());
        Arbitrary<InvestmentExperience> exp = Arbitraries.of(InvestmentExperience.values());
        Arbitrary<IncomeBracket> income = Arbitraries.of(IncomeBracket.values());
        Arbitrary<NetWorthBand> worth = Arbitraries.of(NetWorthBand.values());
        Arbitrary<Integer> horizon = Arbitraries.integers().between(1, 360);
        Arbitrary<RegionalPreference> region = Arbitraries.of(RegionalPreference.values());
        Arbitrary<BigDecimal> roi = Arbitraries.doubles().between(0.1, 50.0)
                .map(d -> BigDecimal.valueOf(d).setScale(2, RoundingMode.HALF_UP));

        return Combinators.combine(risk, exp, income, worth, horizon, region, roi)
                .as((r, e, i, w, h, reg, targetRoi) ->
                        new FinancialProfileRequest(r, e, i, w, h, Set.of(reg), targetRoi));
    }
}
