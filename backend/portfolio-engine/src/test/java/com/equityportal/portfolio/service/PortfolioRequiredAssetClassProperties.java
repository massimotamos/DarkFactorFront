package com.equityportal.portfolio.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import net.jqwik.api.*;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

// Feature: equity-trading-portal, Property 12: Portfolio recommendation contains required asset classes
class PortfolioRequiredAssetClassProperties {

    private final InstrumentUniverseService instrumentUniverseService =
            Mockito.mock(InstrumentUniverseService.class);
    private final MarketDataIngestionService marketDataIngestionService =
            Mockito.mock(MarketDataIngestionService.class);
    private final PortfolioRecommendationRepository portfolioRecommendationRepository =
            Mockito.mock(PortfolioRecommendationRepository.class);
    private final FinancialProfileRepository financialProfileRepository =
            Mockito.mock(FinancialProfileRepository.class);

    private final PortfolioRecommendationService service = new PortfolioRecommendationService(
            instrumentUniverseService,
            marketDataIngestionService,
            portfolioRecommendationRepository,
            financialProfileRepository
    );

    // Fixed instrument universe: 3 equities + 3 bonds
    private static final List<Instrument> EQUITIES = List.of(
            instrument(AssetClass.EQUITY, RegionalPreference.NORTH_AMERICA, "AAPL"),
            instrument(AssetClass.EQUITY, RegionalPreference.EUROPE, "VOD"),
            instrument(AssetClass.EQUITY, RegionalPreference.ASIA_PACIFIC, "7203")
    );
    private static final List<Instrument> BONDS = List.of(
            instrument(AssetClass.BOND, RegionalPreference.NORTH_AMERICA, "US10Y"),
            instrument(AssetClass.BOND, RegionalPreference.EUROPE, "DE10Y"),
            instrument(AssetClass.BOND, RegionalPreference.ASIA_PACIFIC, "JP10Y")
    );

    @Property(tries = 100)
    void portfolioContainsAtLeastOneEquityAndOneBond(
            @ForAll("validProfiles") FinancialProfile profile
    ) {
        UUID userId = UUID.randomUUID();
        profile.setUserId(userId);

        setupMocks(profile, userId);

        PortfolioRecommendation rec = service.generate(userId);

        List<UUID> instrumentIds = rec.getAllocations().stream()
                .map(AllocationLine::getInstrumentId)
                .toList();

        boolean hasEquity = EQUITIES.stream().anyMatch(e -> instrumentIds.contains(e.getId()));
        boolean hasBond = BONDS.stream().anyMatch(b -> instrumentIds.contains(b.getId()));

        assertThat(hasEquity).as("Portfolio must contain at least one EQUITY").isTrue();
        assertThat(hasBond).as("Portfolio must contain at least one BOND").isTrue();
    }

    // Validates: Requirements 3.2

    private void setupMocks(FinancialProfile profile, UUID userId) {
        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());
        when(portfolioRecommendationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Return instruments for any asset class / region combination
        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.EQUITY), any())).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.BOND), any())).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.STRUCTURED_PRODUCT), any())).thenReturn(List.of());
        when(instrumentUniverseService.findByAssetClass(AssetClass.EQUITY)).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClass(AssetClass.BOND)).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClass(AssetClass.STRUCTURED_PRODUCT)).thenReturn(List.of());
    }

    private static Instrument instrument(AssetClass assetClass, RegionalPreference region, String ticker) {
        Instrument inst = new Instrument();
        inst.setId(UUID.randomUUID());
        inst.setTicker(ticker);
        inst.setName(ticker + " Name");
        inst.setAssetClass(assetClass);
        inst.setRegion(region);
        inst.setCurrency("USD");
        inst.setLastUpdated(Instant.now());
        return inst;
    }

    @Provide
    Arbitrary<FinancialProfile> validProfiles() {
        return Combinators.combine(
                Arbitraries.of(RiskTolerance.values()),
                Arbitraries.integers().between(1, 360),
                Arbitraries.of(RegionalPreference.values()),
                Arbitraries.doubles().between(0.1, 50.0).map(d -> BigDecimal.valueOf(Math.round(d * 100.0) / 100.0))
        ).as((risk, horizon, region, roi) -> {
            FinancialProfile p = new FinancialProfile();
            p.setRiskTolerance(risk);
            p.setHorizonMonths(horizon);
            p.setRegions(Set.of(region));
            p.setTargetRoiPercent(roi);
            p.setExperience(InvestmentExperience.INTERMEDIATE);
            p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
            p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
            p.setUpdatedAt(Instant.now());
            return p;
        });
    }
}
