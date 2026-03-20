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
 * Property 18: For any equity allocation with weightPercent > 10 and available market data,
 * the overlay contains a PROTECTIVE_PUT position for that allocation.
 *
 * Validates: Requirements 10.2
 */
class DerivativeVanillaOptionProperties {

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
    void equityAllocationAbove10WithMarketData_hasProtectivePut(
            @ForAll("largeEquityAllocations") AllocationLine allocation
    ) {
        UUID portfolioId = UUID.randomUUID();

        Instrument instrument = buildEquityInstrument(allocation.getInstrumentId(), "AAPL");
        when(instrumentRepository.findById(allocation.getInstrumentId()))
                .thenReturn(Optional.of(instrument));

        MarketDataSnapshot snapshot = buildSnapshot("AAPL", new BigDecimal("150.00"));
        when(marketDataIngestionService.getSnapshot(eq("AAPL"))).thenReturn(Optional.of(snapshot));

        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(allocation));
        FinancialProfile profile = buildProfile(RiskTolerance.MODERATE, 12);

        DerivativeOverlay overlay = service.generateOverlay(recommendation, profile);

        assertThat(overlay.getPositions())
                .as("Overlay must contain a PROTECTIVE_PUT for equity allocation > 10%")
                .anyMatch(p -> p.getType() == DerivativeType.PROTECTIVE_PUT);
    }

    @Provide
    Arbitrary<AllocationLine> largeEquityAllocations() {
        return Arbitraries.integers().between(11, 40).map(weight -> {
            AllocationLine line = new AllocationLine();
            line.setId(UUID.randomUUID());
            line.setInstrumentId(UUID.randomUUID());
            line.setWeightPercent(new BigDecimal(weight));
            line.setPriceAtGeneration(new BigDecimal("100.00"));
            return line;
        });
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
