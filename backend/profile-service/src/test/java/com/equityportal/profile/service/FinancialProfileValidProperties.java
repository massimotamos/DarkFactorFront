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

// Feature: equity-trading-portal, Property 7: Valid financial profile persisted and retrievable
class FinancialProfileValidProperties {

    private final FinancialProfileRepository repository = Mockito.mock(FinancialProfileRepository.class);
    private final FinancialProfileService service = new FinancialProfileService(repository);

    @Property(tries = 50)
    void validProfileIsPersistedAndRetrievable(
            @ForAll("validHorizonMonths") int horizonMonths,
            @ForAll("validRoiPercent") BigDecimal targetRoi,
            @ForAll("validRegion") RegionalPreference region,
            @ForAll("riskTolerance") RiskTolerance riskTolerance,
            @ForAll("experience") InvestmentExperience experience,
            @ForAll("incomeBracket") IncomeBracket incomeBracket,
            @ForAll("netWorthBand") NetWorthBand netWorthBand
    ) {
        UUID userId = UUID.randomUUID();
        Set<RegionalPreference> regions = Set.of(region);

        FinancialProfileRequest request = new FinancialProfileRequest(
                riskTolerance, experience, incomeBracket, netWorthBand,
                horizonMonths, regions, targetRoi
        );

        FinancialProfile savedEntity = buildEntity(userId, request);

        Mockito.when(repository.save(Mockito.any(FinancialProfile.class))).thenReturn(savedEntity);
        Mockito.when(repository.findByUserId(userId)).thenReturn(Optional.of(savedEntity));

        FinancialProfile created = service.createProfile(userId, request);

        assertThat(created.getUserId()).isEqualTo(userId);
        assertThat(created.getRiskTolerance()).isEqualTo(riskTolerance);
        assertThat(created.getExperience()).isEqualTo(experience);
        assertThat(created.getIncomeBracket()).isEqualTo(incomeBracket);
        assertThat(created.getNetWorthBand()).isEqualTo(netWorthBand);
        assertThat(created.getHorizonMonths()).isEqualTo(horizonMonths);
        assertThat(created.getRegions()).containsExactlyInAnyOrderElementsOf(regions);
        assertThat(created.getTargetRoiPercent()).isEqualByComparingTo(targetRoi);

        FinancialProfile retrieved = service.getProfile(userId);

        assertThat(retrieved.getUserId()).isEqualTo(userId);
        assertThat(retrieved.getRiskTolerance()).isEqualTo(riskTolerance);
        assertThat(retrieved.getHorizonMonths()).isEqualTo(horizonMonths);
        assertThat(retrieved.getTargetRoiPercent()).isEqualByComparingTo(targetRoi);
    }

    // Validates: Requirements 2.1, 2.6

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
    Arbitrary<Integer> validHorizonMonths() {
        return Arbitraries.integers().between(1, 360);
    }

    @Provide
    Arbitrary<BigDecimal> validRoiPercent() {
        return Arbitraries.doubles().between(0.1, 50.0)
                .map(d -> BigDecimal.valueOf(d).setScale(2, RoundingMode.HALF_UP));
    }

    @Provide
    Arbitrary<RegionalPreference> validRegion() {
        return Arbitraries.of(RegionalPreference.values());
    }

    @Provide
    Arbitrary<RiskTolerance> riskTolerance() {
        return Arbitraries.of(RiskTolerance.values());
    }

    @Provide
    Arbitrary<InvestmentExperience> experience() {
        return Arbitraries.of(InvestmentExperience.values());
    }

    @Provide
    Arbitrary<IncomeBracket> incomeBracket() {
        return Arbitraries.of(IncomeBracket.values());
    }

    @Provide
    Arbitrary<NetWorthBand> netWorthBand() {
        return Arbitraries.of(NetWorthBand.values());
    }
}
