package com.equityportal.risk.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.DerivativeOverlayRepository;
import com.equityportal.persistence.repository.InstrumentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Generates derivative overlay proposals for a given portfolio recommendation.
 */
@Service
public class DerivativeOverlayService {

    private static final BigDecimal EQUITY_WEIGHT_THRESHOLD = new BigDecimal("10");
    private static final double PROTECTIVE_PUT_STRIKE_RATIO = 0.95;
    private static final double PROTECTIVE_PUT_VOLATILITY = 0.20;
    private static final double PROTECTIVE_PUT_RISK_FREE_RATE = 0.05;
    private static final double PROTECTIVE_PUT_TIME_TO_EXPIRY = 1.0;

    private final BlackScholesPricingService blackScholesPricingService;
    private final MarketDataIngestionService marketDataIngestionService;
    private final InstrumentRepository instrumentRepository;
    private final DerivativeOverlayRepository derivativeOverlayRepository;

    public DerivativeOverlayService(BlackScholesPricingService blackScholesPricingService,
                                    MarketDataIngestionService marketDataIngestionService,
                                    InstrumentRepository instrumentRepository,
                                    DerivativeOverlayRepository derivativeOverlayRepository) {
        this.blackScholesPricingService = blackScholesPricingService;
        this.marketDataIngestionService = marketDataIngestionService;
        this.instrumentRepository = instrumentRepository;
        this.derivativeOverlayRepository = derivativeOverlayRepository;
    }

    /**
     * Generates and persists a {@link DerivativeOverlay} for the given recommendation and profile.
     */
    public DerivativeOverlay generateOverlay(PortfolioRecommendation recommendation, FinancialProfile profile) {
        List<DerivativePosition> positions = new ArrayList<>();

        for (AllocationLine allocation : recommendation.getAllocations()) {
            Optional<Instrument> instrumentOpt = instrumentRepository.findById(allocation.getInstrumentId());
            if (instrumentOpt.isEmpty()) {
                continue;
            }
            Instrument instrument = instrumentOpt.get();

            if (instrument.getAssetClass() == AssetClass.EQUITY
                    && allocation.getWeightPercent().compareTo(EQUITY_WEIGHT_THRESHOLD) > 0) {
                positions.add(buildProtectivePutPosition(instrument));
            } else if (instrument.getAssetClass() == AssetClass.BOND
                    && profile.getHorizonMonths() > 12) {
                positions.add(buildIrSwapPosition(instrument));
            }
        }

        if (profile.getRiskTolerance() == RiskTolerance.AGGRESSIVE) {
            positions.add(buildExoticOptionPosition());
        }

        DerivativeOverlay overlay = new DerivativeOverlay();
        overlay.setPortfolioId(recommendation.getId());
        overlay.setGeneratedAt(Instant.now());
        overlay.setPositions(positions);

        return derivativeOverlayRepository.save(overlay);
    }

    private DerivativePosition buildProtectivePutPosition(Instrument instrument) {
        DerivativePosition position = new DerivativePosition();
        position.setType(DerivativeType.PROTECTIVE_PUT);

        Optional<MarketDataSnapshot> snapshotOpt = marketDataIngestionService.getSnapshot(instrument.getTicker());

        if (snapshotOpt.isPresent()) {
            BigDecimal spot = snapshotOpt.get().getPrice();
            BigDecimal strike = spot.multiply(BigDecimal.valueOf(PROTECTIVE_PUT_STRIKE_RATIO))
                    .setScale(6, RoundingMode.HALF_UP);
            BigDecimal volatility = BigDecimal.valueOf(PROTECTIVE_PUT_VOLATILITY);
            BigDecimal riskFreeRate = BigDecimal.valueOf(PROTECTIVE_PUT_RISK_FREE_RATE);
            BigDecimal timeToExpiry = BigDecimal.valueOf(PROTECTIVE_PUT_TIME_TO_EXPIRY);

            BigDecimal putPrice = blackScholesPricingService.putPrice(spot, strike, volatility, riskFreeRate, timeToExpiry);
            BigDecimal estimatedCostPercent = putPrice.divide(spot, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);

            position.setSpotPrice(spot);
            position.setStrikePrice(strike);
            position.setImpliedVolatility(volatility);
            position.setRiskFreeRate(riskFreeRate);
            position.setTimeToExpiryYears(timeToExpiry);
            position.setEstimatedCostPercent(estimatedCostPercent);
            position.setMaxLossReductionPercent(new BigDecimal("5.00"));
            position.setDescription("Protective put on " + instrument.getTicker()
                    + " (strike=" + strike + ", vol=" + PROTECTIVE_PUT_VOLATILITY + ")");
        } else {
            position.setEstimatedCostPercent(BigDecimal.ZERO);
            position.setMaxLossReductionPercent(BigDecimal.ZERO);
            position.setDescription("Protective put on " + instrument.getTicker() + " (pricing unavailable)");
            position.setNotice("Pricing data unavailable for " + instrument.getTicker());
        }

        return position;
    }

    private DerivativePosition buildIrSwapPosition(Instrument instrument) {
        DerivativePosition position = new DerivativePosition();
        position.setType(DerivativeType.IR_SWAP);
        position.setDescription("Interest rate swap hedge for bond " + instrument.getTicker());
        position.setEstimatedCostPercent(new BigDecimal("0.50"));
        position.setMaxLossReductionPercent(new BigDecimal("3.00"));
        return position;
    }

    private DerivativePosition buildExoticOptionPosition() {
        DerivativePosition position = new DerivativePosition();
        position.setType(DerivativeType.EXOTIC_OPTION);
        position.setDescription("Exotic option for aggressive risk profile upside capture");
        position.setEstimatedCostPercent(new BigDecimal("2.00"));
        position.setMaxLossReductionPercent(new BigDecimal("15.00"));
        return position;
    }
}
