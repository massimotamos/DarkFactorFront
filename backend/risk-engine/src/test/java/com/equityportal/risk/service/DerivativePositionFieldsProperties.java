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
 * Property 21: For any generated overlay, all positions have non-null description,
 * non-negative estimatedCostPercent, and non-negative maxLossReductionPercent.
 *
 * Validates: Requirements 10.5
 */
class DerivativePositionFieldsProperties {

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
    void allPositionsHaveValidFields(
            @ForAll("mixedRecommendations") PortfolioRecommendation recommendation,
            @ForAll("anyProfiles") FinancialProfile profile
    ) {
        for (AllocationLine allocation : recommendation.getAllocations()) {
            Instrument instrument = buildInstrument(allocation.getInstrumentId(), AssetClass.EQUITY, "TICK");
            when(instrumentRepository.findById(allocation.getInstrumentId()))
                    .thenReturn(Optional.of(instrument));
        }
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        DerivativeOverlay overlay = service.generateOverlay(recommendation, profile);

        for (DerivativePosition position : overlay.getPositions()) {
            assertThat(position.getDescription())
                    .as("Position description must not be null")
                    .isNotNull();
            assertThat(position.getEstimatedCostPercent())
                    .as("estimatedCostPercent must not be null")
                    .isNotNull();
            assertThat(position.getEstimatedCostPercent())
                    .as("estimatedCostPercent must be non-negative")
                    .isGreaterThanOrEqualTo(BigDecimal.ZERO);
            assertThat(position.getMaxLossReductionPercent())
                    .as("maxLossReductionPercent must not be null")
                    .isNotNull();
            assertThat(position.getMaxLossReductionPercent())
                    .as("maxLossReductionPercent must be non-negative")
                    .isGreaterThanOrEqualTo(BigDecimal.ZERO);
        }
    }

    @Provide
    Arbitrary<PortfolioRecommendation> mixedRecommendations() {
        return Arbitraries.integers().between(11, 40).map(weight -> {
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

    @Provide
    Arbitrary<FinancialProfile> anyProfiles() {
        return Combinators.combine(
                Arbitraries.of(RiskTolerance.values()),
                Arbitraries.integers().between(1, 360)
        ).as((risk, horizon) -> {
            FinancialProfile p = new FinancialProfile();
            p.setId(UUID.randomUUID());
            p.setUserId(UUID.randomUUID());
            p.setRiskTolerance(risk);
            p.setHorizonMonths(horizon);
            p.setExperience(InvestmentExperience.INTERMEDIATE);
            p.setIncomeBracket(IncomeBracket.BETWEEN_60K_100K);
            p.setNetWorthBand(NetWorthBand.BETWEEN_250K_1M);
            p.setTargetRoiPercent(new BigDecimal("8.00"));
            p.setUpdatedAt(Instant.now());
            return p;
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
