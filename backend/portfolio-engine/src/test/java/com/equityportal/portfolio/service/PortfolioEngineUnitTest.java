package com.equityportal.portfolio.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import com.equityportal.portfolio.exception.ProfileNotFoundException;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PortfolioEngineUnitTest {

    @Mock private InstrumentUniverseService instrumentUniverseService;
    @Mock private MarketDataIngestionService marketDataIngestionService;
    @Mock private PortfolioRecommendationRepository portfolioRecommendationRepository;
    @Mock private FinancialProfileRepository financialProfileRepository;

    private PortfolioRecommendationService service;

    private static final List<Instrument> EQUITIES = List.of(
            instrument(AssetClass.EQUITY, RegionalPreference.NORTH_AMERICA, "AAPL"),
            instrument(AssetClass.EQUITY, RegionalPreference.EUROPE, "VOD")
    );
    private static final List<Instrument> BONDS = List.of(
            instrument(AssetClass.BOND, RegionalPreference.NORTH_AMERICA, "US10Y"),
            instrument(AssetClass.BOND, RegionalPreference.EUROPE, "DE10Y")
    );

    @BeforeEach
    void setUp() {
        service = new PortfolioRecommendationService(
                instrumentUniverseService,
                marketDataIngestionService,
                portfolioRecommendationRepository,
                financialProfileRepository
        );
    }

    @Test
    void noProfile_throwsProfileNotFoundException() {
        UUID userId = UUID.randomUUID();
        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.generate(userId))
                .isInstanceOf(ProfileNotFoundException.class);
    }

    @Test
    void marketDataUnavailable_usesDefaultPrice_setsDataWarning() {
        UUID userId = UUID.randomUUID();
        FinancialProfile profile = buildProfile(userId, RiskTolerance.MODERATE, 24);

        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());
        when(portfolioRecommendationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        setupInstrumentMocks();

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec).isNotNull();
        assertThat(rec.getDataWarning()).isNotNull();
        assertThat(rec.getAllocations()).isNotEmpty();
        // All prices should be the default 1.00
        rec.getAllocations().forEach(line ->
                assertThat(line.getPriceAtGeneration()).isEqualByComparingTo(new BigDecimal("1.00"))
        );
    }

    @Test
    void allWeightsWithinConstraints() {
        UUID userId = UUID.randomUUID();
        FinancialProfile profile = buildProfile(userId, RiskTolerance.CONSERVATIVE, 12);

        when(financialProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());
        when(portfolioRecommendationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        setupInstrumentMocks();

        PortfolioRecommendation rec = service.generate(userId);

        assertThat(rec.getAllocations()).isNotEmpty();
        for (AllocationLine line : rec.getAllocations()) {
            assertThat(line.getWeightPercent())
                    .as("Weight must be > 0")
                    .isGreaterThan(BigDecimal.ZERO);
            assertThat(line.getWeightPercent())
                    .as("Weight must be <= 40")
                    .isLessThanOrEqualTo(new BigDecimal("40.00"));
        }
    }

    private void setupInstrumentMocks() {
        when(instrumentUniverseService.findByAssetClassAndRegion(
                eq(AssetClass.EQUITY), any())).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                eq(AssetClass.BOND), any())).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClassAndRegion(
                eq(AssetClass.STRUCTURED_PRODUCT), any())).thenReturn(List.of());
        when(instrumentUniverseService.findByAssetClass(AssetClass.EQUITY)).thenReturn(EQUITIES);
        when(instrumentUniverseService.findByAssetClass(AssetClass.BOND)).thenReturn(BONDS);
        when(instrumentUniverseService.findByAssetClass(AssetClass.STRUCTURED_PRODUCT)).thenReturn(List.of());
    }

    private static FinancialProfile buildProfile(UUID userId, RiskTolerance risk, int horizon) {
        FinancialProfile p = new FinancialProfile();
        p.setUserId(userId);
        p.setRiskTolerance(risk);
        p.setHorizonMonths(horizon);
        p.setRegions(Set.of(RegionalPreference.NORTH_AMERICA));
        p.setTargetRoiPercent(new BigDecimal("8.00"));
        p.setExperience(InvestmentExperience.INTERMEDIATE);
        p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
        p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
        p.setUpdatedAt(Instant.now());
        return p;
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
