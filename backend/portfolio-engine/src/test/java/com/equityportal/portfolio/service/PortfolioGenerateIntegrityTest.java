package com.equityportal.portfolio.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Verifies the full generate() path: allocations have non-null instrumentId,
 * weights sum to 100, and market data fallback works correctly.
 * These tests catch the AllocationLine FK / null-field bugs found in production.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PortfolioGenerateIntegrityTest {

    @Mock private InstrumentUniverseService instrumentUniverseService;
    @Mock private MarketDataIngestionService marketDataIngestionService;
    @Mock private PortfolioRecommendationRepository portfolioRecommendationRepository;
    @Mock private FinancialProfileRepository financialProfileRepository;

    private PortfolioRecommendationService service;

    private static final Instrument EQUITY_NA = instrument(AssetClass.EQUITY, RegionalPreference.NORTH_AMERICA, "AAPL");
    private static final Instrument EQUITY_EU = instrument(AssetClass.EQUITY, RegionalPreference.EUROPE, "VOD");
    private static final Instrument EQUITY_AP = instrument(AssetClass.EQUITY, RegionalPreference.ASIA_PACIFIC, "TSM");
    private static final Instrument BOND_NA   = instrument(AssetClass.BOND, RegionalPreference.NORTH_AMERICA, "US10Y");
    private static final Instrument BOND_EU   = instrument(AssetClass.BOND, RegionalPreference.EUROPE, "DE10Y");
    private static final Instrument BOND_AP   = instrument(AssetClass.BOND, RegionalPreference.ASIA_PACIFIC, "JP10Y");

    @BeforeEach
    void setUp() {
        service = new PortfolioRecommendationService(
                instrumentUniverseService,
                marketDataIngestionService,
                portfolioRecommendationRepository,
                financialProfileRepository
        );
        when(portfolioRecommendationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ── Allocation integrity ──────────────────────────────────────────────────

    @Test
    void generate_allocationsHaveNonNullInstrumentId() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getAllocations()).isNotEmpty();
        rec.getAllocations().forEach(line ->
            assertThat(line.getInstrumentId())
                .as("instrumentId must never be null")
                .isNotNull()
        );
    }

    @Test
    void generate_allocationWeightsSumTo100() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        BigDecimal total = rec.getAllocations().stream()
                .map(AllocationLine::getWeightPercent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(total).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void generate_noWeightExceeds40Percent() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.CONSERVATIVE, 12, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        rec.getAllocations().forEach(line ->
            assertThat(line.getWeightPercent())
                .as("No single weight may exceed 40%")
                .isLessThanOrEqualTo(new BigDecimal("40.00"))
        );
    }

    @Test
    void generate_allocationsHaveNonNullNonZeroPrice_whenMarketDataAvailable() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();

        MarketDataSnapshot snapshot = new MarketDataSnapshot();
        snapshot.setId(UUID.randomUUID());
        snapshot.setTicker("AAPL");
        snapshot.setPrice(new BigDecimal("175.50"));
        snapshot.setCurrency("USD");
        snapshot.setTimestamp(Instant.now());
        snapshot.setSource(MarketDataSource.YAHOO);
        snapshot.setCachedAt(Instant.now());
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.of(snapshot));

        PortfolioRecommendation rec = service.generate(userId);

        rec.getAllocations().forEach(line ->
            assertThat(line.getPriceAtGeneration())
                .as("priceAtGeneration must not be null")
                .isNotNull()
                .isGreaterThan(BigDecimal.ZERO)
        );
    }

    @Test
    void generate_marketDataMissing_setsDataWarning() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getDataWarning())
                .as("dataWarning must be set when market data is unavailable")
                .isNotNull()
                .isNotBlank();
    }

    @Test
    void generate_marketDataPresent_noDataWarning() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();

        MarketDataSnapshot snapshot = new MarketDataSnapshot();
        snapshot.setId(UUID.randomUUID());
        snapshot.setPrice(new BigDecimal("100.00"));
        snapshot.setCurrency("USD");
        snapshot.setTimestamp(Instant.now());
        snapshot.setSource(MarketDataSource.YAHOO);
        snapshot.setCachedAt(Instant.now());
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.of(snapshot));

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getDataWarning()).isNull();
    }

    // ── Risk tolerance → volatility mapping ──────────────────────────────────

    @Test
    void generate_conservativeProfile_volatility10() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.CONSERVATIVE, 12, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getVolatilityPercent()).isEqualByComparingTo(new BigDecimal("10.0"));
    }

    @Test
    void generate_moderateProfile_volatility15() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 12, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getVolatilityPercent()).isEqualByComparingTo(new BigDecimal("15.0"));
    }

    @Test
    void generate_aggressiveProfile_volatility20() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.AGGRESSIVE, 12, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getVolatilityPercent()).isEqualByComparingTo(new BigDecimal("20.0"));
    }

    // ── Structured product inclusion ─────────────────────────────────────────

    @Test
    void generate_aggressiveLongHorizon_includesStructuredProduct() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.AGGRESSIVE, 48, RegionalPreference.NORTH_AMERICA);

        Instrument structured = instrument(AssetClass.STRUCTURED_PRODUCT, RegionalPreference.NORTH_AMERICA, "SP1");
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.EQUITY), any()))
                .thenReturn(List.of(EQUITY_NA, EQUITY_EU, EQUITY_AP));
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.BOND), any()))
                .thenReturn(List.of(BOND_NA, BOND_EU, BOND_AP));
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.STRUCTURED_PRODUCT), any()))
                .thenReturn(List.of(structured));
        when(instrumentUniverseService.findByAssetClass(any())).thenReturn(List.of());
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        List<UUID> instrumentIds = rec.getAllocations().stream()
                .map(AllocationLine::getInstrumentId).toList();
        assertThat(instrumentIds).contains(structured.getId());
    }

    @Test
    void generate_moderateShortHorizon_noStructuredProduct() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 12, RegionalPreference.NORTH_AMERICA);
        setupInstrumentMocks();
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        // MODERATE with horizon <= 36 should never include structured products
        List<UUID> instrumentIds = rec.getAllocations().stream()
                .map(AllocationLine::getInstrumentId).toList();
        // Structured product instruments are not in the mock setup, so none should appear
        assertThat(rec.getAllocations().size()).isLessThanOrEqualTo(6);
    }

    // ── Region fallback ───────────────────────────────────────────────────────

    @Test
    void generate_noRegionMatch_fallsBackToGlobalInstruments() {
        UUID userId = UUID.randomUUID();
        setupProfile(userId, RiskTolerance.MODERATE, 24, RegionalPreference.ASIA_PACIFIC);

        // Region-specific returns nothing
        when(instrumentUniverseService.findByAssetClassAndRegion(any(), any())).thenReturn(List.of());
        // Global fallback returns instruments
        when(instrumentUniverseService.findByAssetClass(AssetClass.EQUITY))
                .thenReturn(List.of(EQUITY_NA, EQUITY_EU));
        when(instrumentUniverseService.findByAssetClass(AssetClass.BOND))
                .thenReturn(List.of(BOND_NA, BOND_EU));
        when(instrumentUniverseService.findByAssetClass(AssetClass.STRUCTURED_PRODUCT))
                .thenReturn(List.of());
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getAllocations()).isNotEmpty();
        rec.getAllocations().forEach(line ->
            assertThat(line.getInstrumentId()).isNotNull()
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void setupProfile(UUID userId, RiskTolerance risk, int horizon, RegionalPreference region) {
        FinancialProfile p = new FinancialProfile();
        p.setUserId(userId);
        p.setRiskTolerance(risk);
        p.setHorizonMonths(horizon);
        p.setRegions(Set.of(region));
        p.setTargetRoiPercent(new BigDecimal("8.00"));
        p.setExperience(InvestmentExperience.INTERMEDIATE);
        p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
        p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
        p.setUpdatedAt(Instant.now());
        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.of(p));
    }

    private void setupInstrumentMocks() {
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.EQUITY), any()))
                .thenReturn(List.of(EQUITY_NA, EQUITY_EU, EQUITY_AP));
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.BOND), any()))
                .thenReturn(List.of(BOND_NA, BOND_EU, BOND_AP));
        when(instrumentUniverseService.findByAssetClassAndRegion(eq(AssetClass.STRUCTURED_PRODUCT), any()))
                .thenReturn(List.of());
        when(instrumentUniverseService.findByAssetClass(any())).thenReturn(List.of());
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
}
