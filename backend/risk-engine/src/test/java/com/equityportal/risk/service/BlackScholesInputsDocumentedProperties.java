package com.equityportal.risk.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.DerivativeOverlayRepository;
import com.equityportal.persistence.repository.InstrumentRepository;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.BeforeProperty;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Property 22: For any PROTECTIVE_PUT position generated with available market data,
 * the position has non-null spotPrice, strikePrice, impliedVolatility, riskFreeRate,
 * and timeToExpiryYears.
 *
 * Validates: Requirements 10.6
 */
class BlackScholesInputsDocumentedProperties {

    private BlackScholesPricingService blackScholesPricingService;
    private MarketDataIngestionService marketDataIngestionService;
    private InstrumentRepository instrumentRepository;
    private DerivativeOverlayRepository derivativeOverlayRepository;
    private DerivativeOverlayService service;

    @BeforeProperty
    void setUp() {
        blackScholesPricingService = new BlackScholesPricingService();
        marketDataIngestionService = Mockito.mock(MarketDataIngestionService.class);
        instrumentRepository = Mockito.mock(InstrumentRepository.class);
        derivativeOverlayRepository = Mockito.mock(DerivativeOverlayRepository.class);

        service = new DerivativeOverlayService(
                blackScholesPricingService,
                marketDataIngestionService,
                instrumentRepository,
                derivativeOverlayRepository
        );

        when(derivativeOverlayRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Property(tries = 50)
    void protectivePutWithMarketData_hasAllBlackScholesInputs(
            @ForAll("spotPrices") BigDecimal spotPrice
    ) {
        UUID portfolioId = UUID.randomUUID();
        UUID instrumentId = UUID.randomUUID();

        AllocationLine line = new AllocationLine();
        line.setId(UUID.randomUUID());
        line.setInstrumentId(instrumentId);
        line.setWeightPercent(new BigDecimal("20")); // > 10%
        line.setPriceAtGeneration(spotPrice);

        Instrument instrument = buildEquityInstrument(instrumentId, "AAPL");
        when(instrumentRepository.findById(instrumentId)).thenReturn(Optional.of(instrument));

        MarketDataSnapshot snapshot = buildSnapshot("AAPL", spotPrice);
        when(marketDataIngestionService.getSnapshot(eq("AAPL"))).thenReturn(Optional.of(snapshot));

        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(line));
        FinancialProfile profile = buildProfile(RiskTolerance.MODERATE, 12);

        DerivativeOverlay overlay = service.generateOverlay(recommendation, profile);

        List<DerivativePosition> protectivePuts = overlay.getPositions().stream()
                .filter(p -> p.getType() == DerivativeType.PROTECTIVE_PUT)
                .toList();

        assertThat(protectivePuts)
                .as("Should have at least one PROTECTIVE_PUT position")
                .isNotEmpty();

        for (DerivativePosition position : protectivePuts) {
            assertThat(position.getSpotPrice())
                    .as("spotPrice must not be null for PROTECTIVE_PUT with market data")
                    .isNotNull();
            assertThat(position.getStrikePrice())
                    .as("strikePrice must not be null for PROTECTIVE_PUT with market data")
                    .isNotNull();
            assertThat(position.getImpliedVolatility())
                    .as("impliedVolatility must not be null for PROTECTIVE_PUT with market data")
                    .isNotNull();
            assertThat(position.getRiskFreeRate())
                    .as("riskFreeRate must not be null for PROTECTIVE_PUT with market data")
                    .isNotNull();
            assertThat(position.getTimeToExpiryYears())
                    .as("timeToExpiryYears must not be null for PROTECTIVE_PUT with market data")
                    .isNotNull();
        }
    }

    @Provide
    Arbitrary<BigDecimal> spotPrices() {
        return Arbitraries.doubles().between(10.0, 1000.0)
                .map(d -> BigDecimal.valueOf(Math.round(d * 100.0) / 100.0));
    }

    private static Instrument buildEquityInstrument(UUID id, String ticker) {
        Instrument inst = new Instrument();
        inst.setId(id);
        inst.setTicker(ticker);
        inst.setName(ticker + " Name");
        inst.setAssetClass(AssetClass.EQUITY);
        inst.setRegion(RegionalPreference.NORTH_AMERICA);
        inst.setCurrency("USD");
        inst.setLastUpdated(Instant.now());
        return inst;
    }

    private static MarketDataSnapshot buildSnapshot(String ticker, BigDecimal price) {
        MarketDataSnapshot snapshot = new MarketDataSnapshot();
        snapshot.setId(UUID.randomUUID());
        snapshot.setTicker(ticker);
        snapshot.setPrice(price);
        snapshot.setCurrency("USD");
        snapshot.setTimestamp(Instant.now());
        snapshot.setSource(MarketDataSource.YAHOO);
        snapshot.setCachedAt(Instant.now());
        return snapshot;
    }

    private static PortfolioRecommendation buildRecommendation(UUID portfolioId, List<AllocationLine> allocations) {
        PortfolioRecommendation rec = new PortfolioRecommendation();
        rec.setId(portfolioId);
        rec.setUserId(UUID.randomUUID());
        rec.setGeneratedAt(Instant.now());
        rec.setExpectedReturnPercent(new BigDecimal("8.00"));
        rec.setVolatilityPercent(new BigDecimal("12.00"));
        rec.setAllocations(allocations);
        return rec;
    }

    private static FinancialProfile buildProfile(RiskTolerance risk, int horizonMonths) {
        FinancialProfile p = new FinancialProfile();
        p.setId(UUID.randomUUID());
        p.setUserId(UUID.randomUUID());
        p.setRiskTolerance(risk);
        p.setHorizonMonths(horizonMonths);
        p.setExperience(InvestmentExperience.INTERMEDIATE);
        p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
        p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
        p.setTargetRoiPercent(new BigDecimal("8.00"));
        p.setUpdatedAt(Instant.now());
        return p;
    }
}
