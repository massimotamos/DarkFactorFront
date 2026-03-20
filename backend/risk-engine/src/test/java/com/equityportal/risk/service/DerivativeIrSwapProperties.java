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
import static org.mockito.Mockito.when;

/**
 * Property 19: For any bond allocation with profile.horizonMonths > 12,
 * the overlay contains an IR_SWAP position.
 *
 * Validates: Requirements 10.3
 */
class DerivativeIrSwapProperties {

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
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());
    }

    @Property(tries = 50)
    void bondAllocationWithLongHorizon_hasIrSwap(
            @ForAll("bondAllocations") AllocationLine allocation,
            @ForAll("longHorizonProfiles") FinancialProfile profile
    ) {
        UUID portfolioId = UUID.randomUUID();

        Instrument instrument = buildBondInstrument(allocation.getInstrumentId(), "US10Y");
        when(instrumentRepository.findById(allocation.getInstrumentId()))
                .thenReturn(Optional.of(instrument));

        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(allocation));

        DerivativeOverlay overlay = service.generateOverlay(recommendation, profile);

        assertThat(overlay.getPositions())
                .as("Overlay must contain an IR_SWAP for bond allocation with horizon > 12 months")
                .anyMatch(p -> p.getType() == DerivativeType.IR_SWAP);
    }

    @Provide
    Arbitrary<AllocationLine> bondAllocations() {
        return Arbitraries.integers().between(1, 40).map(weight -> {
            AllocationLine line = new AllocationLine();
            line.setId(UUID.randomUUID());
            line.setInstrumentId(UUID.randomUUID());
            line.setWeightPercent(new BigDecimal(weight));
            line.setPriceAtGeneration(new BigDecimal("100.00"));
            return line;
        });
    }

    @Provide
    Arbitrary<FinancialProfile> longHorizonProfiles() {
        return Arbitraries.integers().between(13, 360).map(horizon -> {
            FinancialProfile p = new FinancialProfile();
            p.setId(UUID.randomUUID());
            p.setUserId(UUID.randomUUID());
            p.setRiskTolerance(RiskTolerance.MODERATE);
            p.setHorizonMonths(horizon);
            p.setExperience(InvestmentExperience.INTERMEDIATE);
            p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
            p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
            p.setTargetRoiPercent(new BigDecimal("8.00"));
            p.setUpdatedAt(Instant.now());
            return p;
        });
    }

    private static Instrument buildBondInstrument(UUID id, String ticker) {
        Instrument inst = new Instrument();
        inst.setId(id);
        inst.setTicker(ticker);
        inst.setName(ticker + " Name");
        inst.setAssetClass(AssetClass.BOND);
        inst.setRegion(RegionalPreference.NORTH_AMERICA);
        inst.setCurrency("USD");
        inst.setLastUpdated(Instant.now());
        return inst;
    }

    private static PortfolioRecommendation buildRecommendation(UUID portfolioId, List<AllocationLine> allocations) {
        PortfolioRecommendation rec = new PortfolioRecommendation();
        rec.setId(portfolioId);
        rec.setUserId(UUID.randomUUID());
        rec.setGeneratedAt(Instant.now());
        rec.setExpectedReturnPercent(new BigDecimal("5.00"));
        rec.setVolatilityPercent(new BigDecimal("8.00"));
        rec.setAllocations(allocations);
        return rec;
    }
}
