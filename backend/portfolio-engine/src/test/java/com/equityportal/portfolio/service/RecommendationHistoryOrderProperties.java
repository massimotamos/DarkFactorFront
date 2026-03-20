package com.equityportal.portfolio.service;

import com.equityportal.persistence.entity.PortfolioRecommendation;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import net.jqwik.api.*;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// Feature: equity-trading-portal, Property 16: Historical recommendations ordered by timestamp descending
class RecommendationHistoryOrderProperties {

    private final PortfolioRecommendationRepository repository =
            Mockito.mock(PortfolioRecommendationRepository.class);

    private final RecommendationHistoryService service = new RecommendationHistoryService(repository);

    @Property(tries = 100)
    void historyIsOrderedByGeneratedAtDescending(
            @ForAll("arbitraryRecommendationLists") List<PortfolioRecommendation> recommendations
    ) {
        UUID userId = UUID.randomUUID();

        // Sort descending (simulating what the repository would return)
        List<PortfolioRecommendation> sorted = recommendations.stream()
                .sorted(Comparator.comparing(PortfolioRecommendation::getGeneratedAt).reversed())
                .collect(Collectors.toList());

        when(repository.findByUserIdOrderByGeneratedAtDesc(userId)).thenReturn(sorted);

        List<PortfolioRecommendation> result = service.getHistory(userId);

        for (int i = 0; i < result.size() - 1; i++) {
            Instant current = result.get(i).getGeneratedAt();
            Instant next = result.get(i + 1).getGeneratedAt();
            assertThat(current)
                    .as("Recommendation at index %d should be >= recommendation at index %d", i, i + 1)
                    .isAfterOrEqualTo(next);
        }
    }

    // Validates: Requirements 3.8

    @Provide
    Arbitrary<List<PortfolioRecommendation>> arbitraryRecommendationLists() {
        return Arbitraries.longs()
                .between(0L, 1_000_000_000L)
                .list()
                .ofMinSize(0)
                .ofMaxSize(10)
                .map(offsets -> offsets.stream()
                        .map(offset -> {
                            PortfolioRecommendation rec = new PortfolioRecommendation();
                            rec.setId(UUID.randomUUID());
                            rec.setUserId(UUID.randomUUID());
                            rec.setGeneratedAt(Instant.ofEpochSecond(offset));
                            rec.setExpectedReturnPercent(new BigDecimal("8.00"));
                            rec.setVolatilityPercent(new BigDecimal("15.00"));
                            return rec;
                        })
                        .collect(Collectors.toList()));
    }
}
