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

// Feature: equity-trading-portal, Property 13: Aggressive long-horizon portfolio includes structured product
class PortfolioStructuredProductProperties {

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

    private static final List<Instrument> EQUITIES = List.of(
            instrument(AssetClass.EQUITY, RegionalPreference.NORTH_AMERICA, "AAPL"),
            instrument(AssetClass.EQUITY, RegionalPreference.EUROPE, "VOD")
    );
    private static final List<Instrument> BONDS = List.of(
            instrument(AssetClass.BOND, RegionalPreference.NORTH_AMERICA, "US10Y"),
            instrument(AssetClass.BOND, RegionalPreference.EUROPE, "DE10Y")
    );
    private static final List<Instrument> STRUCTURED = List.of(
            instrument(AssetClass.STRUCTURED_PRODUCT, RegionalPreference.NORTH_AMERICA, "SP1"),
            instrument(AssetClass.STRUCTURED_PRODUCT, RegionalPreference.EUROPE, "SP2")
    );

    @Property(tries = 100)
    void aggressiveLongHorizonIncludesStructuredProduct(
            @ForAll("aggressiveLongHorizonProfiles") FinancialProfile profile
    ) {
        UUID userId = UUID.randomUUID();
        profile.setUserId(userId);

        setupMocks(profile, userId);

        PortfolioRecommendation rec = service.generate(userId);

        List<UUID> instrumentIds = rec.getAllocations().stream()
                .map(AllocationLine::getInstrumentId)
                .toList();

        boolean hasStructured = STRUCTURED.stream().anyMatch(s -> instrumentIds.contains(s.getId()));
        assertThat(hasStructured)
                .as("Aggressive + horizon > 36 portfolio must contain at least one STRUCTURED_PRODUCT")
                .isTrue();
    }

    // Validates: Requirements 3.3

    private void setupMocks(FinancialProfile profile, UUID userId) {
        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());
        when(portfolioRecommendationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.EQUITY), any())).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.BOND), any())).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                Mockito.eq(AssetClass.STRUCTURED_PRODUCT), any())).thenReturn(STRUCTURED);
        when(instrumentUniverseService.findByAssetClass(AssetClass.EQUITY)).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClass(AssetClass.BOND)).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClass(AssetClass.STRUCTURED_PRODUCT)).thenReturn(STRUCTURED);
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
    Arbitrary<FinancialProfile> aggressiveLongHorizonProfiles() {
        return Combinators.combine(
                Arbitraries.integers().between(37, 360),
                Arbitraries.of(RegionalPreference.values()),
                Arbitraries.doubles().between(0.1, 50.0).map(d -> BigDecimal.valueOf(Math.round(d * 100.0) / 100.0))
        ).as((horizon, region, roi) -> {
            FinancialProfile p = new FinancialProfile();
            p.setRiskTolerance(RiskTolerance.AGGRESSIVE);
            p.setHorizonMonths(horizon);
            p.setRegions(Set.of(region));
            p.setTargetRoiPercent(roi);
            p.setExperience(InvestmentExperience.ADVANCED);
            p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
            p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
            p.setUpdatedAt(Instant.now());
            return p;
        });
    }
}
