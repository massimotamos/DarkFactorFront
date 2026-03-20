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
 * Property 20: For any AGGRESSIVE risk profile, the overlay contains at least one EXOTIC_OPTION position.
 *
 * Validates: Requirements 10.4
 */
class DerivativeExoticOptionProperties {

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
    void aggressiveProfile_alwaysHasExoticOption(
            @ForAll("aggressiveProfiles") FinancialProfile profile,
            @ForAll("anyRecommendations") PortfolioRecommendation recommendation
    ) {
        for (AllocationLine allocation : recommendation.getAllocations()) {
            Instrument instrument = buildInstrument(allocation.getInstrumentId(), AssetClass.EQUITY, "TICK");
            when(instrumentRepository.findById(allocation.getInstrumentId()))
                    .thenReturn(Optional.of(instrument));
        }

        DerivativeOverlay overlay = service.generateOverlay(recommendation, profile);

        assertThat(overlay.getPositions())
                .as("Overlay must contain an EXOTIC_OPTION for AGGRESSIVE risk profile")
                .anyMatch(p -> p.getType() == DerivativeType.EXOTIC_OPTION);
    }

    @Provide
    Arbitrary<FinancialProfile> aggressiveProfiles() {
        return Arbitraries.integers().between(1, 360).map(horizon -> {
            FinancialProfile p = new FinancialProfile();
            p.setId(UUID.randomUUID());
            p.setUserId(UUID.randomUUID());
            p.setRiskTolerance(RiskTolerance.AGGRESSIVE);
            p.setHorizonMonths(horizon);
            p.setExperience(InvestmentExperience.INTERMEDIATE);
            p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
            p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
            p.setTargetRoiPercent(new BigDecimal("15.00"));
            p.setUpdatedAt(Instant.now());
            return p;
        });
    }

    @Provide
    Arbitrary<PortfolioRecommendation> anyRecommendations() {
        return Arbitraries.integers().between(1, 10).map(weight -> {
            UUID portfolioId = UUID.randomUUID();
            UUID instrumentId = UUID.randomUUID();

            AllocationLine line = new AllocationLine();
            line.setId(UUID.randomUUID());
            line.setInstrumentId(instrumentId);
            line.setWeightPercent(new BigDecimal(weight));
            line.setPriceAtGeneration(new BigDecimal("100.00"));

            PortfolioRecommendation rec = new PortfolioRecommendation();
            rec.setId(portfolioId);
            rec.setUserId(UUID.randomUUID());
            rec.setGeneratedAt(Instant.now());
            rec.setExpectedReturnPercent(new BigDecimal("8.00"));
            rec.setVolatilityPercent(new BigDecimal("12.00"));
            rec.setAllocations(List.of(line));
            return rec;
        });
    }

    private static Instrument buildInstrument(UUID id, AssetClass assetClass, String ticker) {
        Instrument inst = new Instrument();
        inst.setId(id);
        inst.setTicker(ticker);
        inst.setName(ticker + " Name");
        inst.setAssetClass(assetClass);
        inst.setRegion(RegionalPreference.NORTH_AMERICA);
        inst.setCurrency("USD");
        inst.setLastUpdated(Instant.now());
        return inst;
    }
}
