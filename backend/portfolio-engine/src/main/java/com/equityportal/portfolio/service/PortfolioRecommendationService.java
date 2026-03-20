package com.equityportal.portfolio.service;

import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.*;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import com.equityportal.portfolio.exception.ProfileNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PortfolioRecommendationService {

    private static final BigDecimal MAX_WEIGHT = new BigDecimal("40.00");
    private static final BigDecimal HUNDRED = new BigDecimal("100.00");
    private static final BigDecimal DEFAULT_PRICE = new BigDecimal("1.00");

    private final InstrumentUniverseService instrumentUniverseService;
    private final MarketDataIngestionService marketDataIngestionService;
    private final PortfolioRecommendationRepository portfolioRecommendationRepository;
    private final FinancialProfileRepository financialProfileRepository;

    public PortfolioRecommendationService(
            InstrumentUniverseService instrumentUniverseService,
            MarketDataIngestionService marketDataIngestionService,
            PortfolioRecommendationRepository portfolioRecommendationRepository,
            FinancialProfileRepository financialProfileRepository) {
        this.instrumentUniverseService = instrumentUniverseService;
        this.marketDataIngestionService = marketDataIngestionService;
        this.portfolioRecommendationRepository = portfolioRecommendationRepository;
        this.financialProfileRepository = financialProfileRepository;
    }

    public PortfolioRecommendation generate(UUID userId) {
        FinancialProfile profile = financialProfileRepository.findByUserId(userId)
                .orElseThrow(ProfileNotFoundException::new);

        List<Instrument> selected = selectInstruments(profile);

        List<BigDecimal> weights = distributeWeights(selected.size());

        List<String> missingTickers = new ArrayList<>();
        List<AllocationLine> allocations = new ArrayList<>();
        for (int i = 0; i < selected.size(); i++) {
            Instrument instrument = selected.get(i);
            BigDecimal price = marketDataIngestionService.getSnapshot(instrument.getTicker())
                    .map(MarketDataSnapshot::getPrice)
                    .orElseGet(() -> {
                        missingTickers.add(instrument.getTicker());
                        return DEFAULT_PRICE;
                    });

            AllocationLine line = new AllocationLine();
            line.setInstrumentId(instrument.getId());
            line.setWeightPercent(weights.get(i));
            line.setPriceAtGeneration(price);
            allocations.add(line);
        }

        BigDecimal volatility = switch (profile.getRiskTolerance()) {
            case CONSERVATIVE -> new BigDecimal("10.0");
            case MODERATE -> new BigDecimal("15.0");
            case AGGRESSIVE -> new BigDecimal("20.0");
        };

        PortfolioRecommendation recommendation = new PortfolioRecommendation();
        recommendation.setUserId(userId);
        recommendation.setGeneratedAt(Instant.now());
        recommendation.setExpectedReturnPercent(profile.getTargetRoiPercent());
        recommendation.setVolatilityPercent(volatility);
        recommendation.setAllocations(allocations);

        if (!missingTickers.isEmpty()) {
            recommendation.setDataWarning("Market data unavailable for: " + String.join(", ", missingTickers));
        }

        PortfolioRecommendation saved = portfolioRecommendationRepository.save(recommendation);
        // Preserve transient dataWarning after save
        saved.setDataWarning(recommendation.getDataWarning());
        return saved;
    }

    private List<Instrument> selectInstruments(FinancialProfile profile) {
        List<RegionalPreference> regions = new ArrayList<>(profile.getRegions());

        List<Instrument> equities = collectByAssetClassAndRegions(AssetClass.EQUITY, regions, 3);
        List<Instrument> bonds = collectByAssetClassAndRegions(AssetClass.BOND, regions, 3);

        // Fallback to global if region-specific search yields nothing
        if (equities.isEmpty()) {
            equities = instrumentUniverseService.findByAssetClass(AssetClass.EQUITY)
                    .stream().limit(3).toList();
        }
        if (bonds.isEmpty()) {
            bonds = instrumentUniverseService.findByAssetClass(AssetClass.BOND)
                    .stream().limit(3).toList();
        }

        List<Instrument> selected = new ArrayList<>();
        selected.addAll(equities);
        selected.addAll(bonds);

        boolean includeStructured = profile.getRiskTolerance() == RiskTolerance.AGGRESSIVE
                && profile.getHorizonMonths() > 36;
        if (includeStructured) {
            List<Instrument> structured = collectByAssetClassAndRegions(AssetClass.STRUCTURED_PRODUCT, regions, 2);
            if (structured.isEmpty()) {
                structured = instrumentUniverseService.findByAssetClass(AssetClass.STRUCTURED_PRODUCT)
                        .stream().limit(2).toList();
            }
            selected.addAll(structured);
        }

        return selected;
    }

    private List<Instrument> collectByAssetClassAndRegions(AssetClass assetClass,
                                                            List<RegionalPreference> regions,
                                                            int limit) {
        List<Instrument> result = new ArrayList<>();
        for (RegionalPreference region : regions) {
            for (Instrument inst : instrumentUniverseService.findByAssetClassAndRegion(assetClass, region)) {
                if (!result.contains(inst)) {
                    result.add(inst);
                }
                if (result.size() >= limit) return result;
            }
        }
        return result;
    }

    /**
     * Distributes 100% across N instruments with no single weight exceeding 40%.
     * Uses iterative capping: assign equal base weight, cap at 40, redistribute remainder.
     */
    static List<BigDecimal> distributeWeights(int n) {
        if (n <= 0) return List.of();

        BigDecimal[] weights = new BigDecimal[n];
        BigDecimal total = HUNDRED;
        int uncapped = n;

        // Initial equal distribution
        BigDecimal base = total.divide(BigDecimal.valueOf(n), 10, RoundingMode.HALF_UP);
        for (int i = 0; i < n; i++) {
            weights[i] = base;
        }

        // Iteratively cap weights > 40 and redistribute
        boolean changed = true;
        while (changed) {
            changed = false;
            BigDecimal cappedTotal = BigDecimal.ZERO;
            int freeCnt = 0;
            for (BigDecimal w : weights) {
                if (w.compareTo(MAX_WEIGHT) >= 0) {
                    cappedTotal = cappedTotal.add(MAX_WEIGHT);
                } else {
                    freeCnt++;
                }
            }
            if (freeCnt == 0) break;
            BigDecimal remainder = HUNDRED.subtract(cappedTotal);
            BigDecimal newBase = remainder.divide(BigDecimal.valueOf(freeCnt), 10, RoundingMode.HALF_UP);
            for (int i = 0; i < n; i++) {
                if (weights[i].compareTo(MAX_WEIGHT) >= 0) {
                    if (weights[i].compareTo(MAX_WEIGHT) != 0) {
                        weights[i] = MAX_WEIGHT;
                        changed = true;
                    }
                } else {
                    if (weights[i].compareTo(newBase) != 0) {
                        weights[i] = newBase;
                        changed = true;
                    }
                }
            }
        }

        // Round to 2 decimal places and fix rounding error on last element
        List<BigDecimal> result = new ArrayList<>();
        BigDecimal runningSum = BigDecimal.ZERO;
        for (int i = 0; i < n - 1; i++) {
            BigDecimal rounded = weights[i].setScale(2, RoundingMode.HALF_UP);
            result.add(rounded);
            runningSum = runningSum.add(rounded);
        }
        // Last element gets the remainder to ensure exact sum of 100
        BigDecimal last = HUNDRED.subtract(runningSum).setScale(2, RoundingMode.HALF_UP);
        result.add(last);

        return result;
    }
}
