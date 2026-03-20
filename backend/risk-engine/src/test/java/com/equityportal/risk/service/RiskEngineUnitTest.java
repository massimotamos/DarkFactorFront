package com.equityportal.risk.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.DerivativeOverlayRepository;
import com.equityportal.persistence.repository.InstrumentRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RiskEngineUnitTest {

    @Mock private MarketDataIngestionService marketDataIngestionService;
    @Mock private InstrumentRepository instrumentRepository;
    @Mock private DerivativeOverlayRepository derivativeOverlayRepository;

    private BlackScholesPricingService blackScholesPricingService;
    private DerivativeOverlayService overlayService;

    @BeforeEach
    void setUp() {
        blackScholesPricingService = new BlackScholesPricingService();
        overlayService = new DerivativeOverlayService(
                blackScholesPricingService,
                marketDataIngestionService,
                instrumentRepository,
                derivativeOverlayRepository
        );
        when(derivativeOverlayRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void unavailablePricing_setsNotice_excludesPosition() {
        UUID portfolioId = UUID.randomUUID();
        UUID instrumentId = UUID.randomUUID();

        Instrument equity = buildInstrument(instrumentId, AssetClass.EQUITY, "AAPL");
        when(instrumentRepository.findById(instrumentId)).thenReturn(Optional.of(equity));
        when(marketDataIngestionService.getSnapshot(eq("AAPL"))).thenReturn(Optional.empty());

        AllocationLine line = buildAllocationLine(portfolioId, instrumentId, new BigDecimal("20"));
        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(line));
        FinancialProfile profile = buildProfile(RiskTolerance.MODERATE, 12);

        DerivativeOverlay overlay = overlayService.generateOverlay(recommendation, profile);

        // When pricing is unavailable, the position should have a notice set
        // and no Black-Scholes inputs (spotPrice is null)
        List<DerivativePosition> puts = overlay.getPositions().stream()
                .filter(p -> p.getType() == DerivativeType.PROTECTIVE_PUT)
                .toList();

        assertThat(puts).hasSize(1);
        DerivativePosition put = puts.get(0);
        assertThat(put.getNotice())
                .as("Notice should be set when pricing data is unavailable")
                .isNotNull()
                .contains("AAPL");
        assertThat(put.getSpotPrice())
                .as("spotPrice should be null when pricing data is unavailable")
                .isNull();
    }

    @Test
    void aggressiveProfile_alwaysHasExoticOption() {
        UUID portfolioId = UUID.randomUUID();
        UUID instrumentId = UUID.randomUUID();

        Instrument equity = buildInstrument(instrumentId, AssetClass.EQUITY, "MSFT");
        when(instrumentRepository.findById(instrumentId)).thenReturn(Optional.of(equity));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        AllocationLine line = buildAllocationLine(portfolioId, instrumentId, new BigDecimal("5"));
        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(line));
        FinancialProfile profile = buildProfile(RiskTolerance.AGGRESSIVE, 12);

        DerivativeOverlay overlay = overlayService.generateOverlay(recommendation, profile);

        assertThat(overlay.getPositions())
                .as("AGGRESSIVE profile must always produce an EXOTIC_OPTION position")
                .anyMatch(p -> p.getType() == DerivativeType.EXOTIC_OPTION);
    }

    @Test
    void bondWithLongHorizon_hasIrSwap() {
        UUID portfolioId = UUID.randomUUID();
        UUID instrumentId = UUID.randomUUID();

        Instrument bond = buildInstrument(instrumentId, AssetClass.BOND, "US10Y");
        when(instrumentRepository.findById(instrumentId)).thenReturn(Optional.of(bond));
        when(marketDataIngestionService.getSnapshot(any())).thenReturn(Optional.empty());

        AllocationLine line = buildAllocationLine(portfolioId, instrumentId, new BigDecimal("30"));
        PortfolioRecommendation recommendation = buildRecommendation(portfolioId, List.of(line));
        FinancialProfile profile = buildProfile(RiskTolerance.MODERATE, 24);

        DerivativeOverlay overlay = overlayService.generateOverlay(recommendation, profile);

        assertThat(overlay.getPositions())
                .as("Bond allocation with horizonMonths > 12 must produce an IR_SWAP position")
                .anyMatch(p -> p.getType() == DerivativeType.IR_SWAP);
    }

    @Test
    void blackScholes_callPrice_isPositive() {
        BigDecimal spot = new BigDecimal("100");
        BigDecimal strike = new BigDecimal("100");
        BigDecimal volatility = new BigDecimal("0.2");
        BigDecimal riskFreeRate = new BigDecimal("0.05");
        BigDecimal timeToExpiry = new BigDecimal("1.0");

        BigDecimal callPrice = blackScholesPricingService.callPrice(spot, strike, volatility, riskFreeRate, timeToExpiry);

        assertThat(callPrice)
                .as("Black-Scholes call price for ATM option must be positive")
                .isGreaterThan(BigDecimal.ZERO);
    }

    // ---- helpers ----

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

    private static AllocationLine buildAllocationLine(UUID portfolioId, UUID instrumentId, BigDecimal weight) {
        AllocationLine line = new AllocationLine();
        line.setId(UUID.randomUUID());
        line.setInstrumentId(instrumentId);
        line.setWeightPercent(weight);
        line.setPriceAtGeneration(new BigDecimal("100.00"));
        return line;
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
