package com.equityportal.marketdata.service;

import com.equityportal.marketdata.client.AlphaVantageClient;
import com.equityportal.marketdata.client.YahooFinanceClient;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.equityportal.persistence.repository.MarketDataSnapshotRepository;
import net.jqwik.api.*;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Feature: equity-trading-portal, Property 24: Staleness flag set for old market data
class MarketDataStalenessProperties {

    // In-memory stub for MarketDataSnapshotRepository backed by a HashMap
    private static MarketDataSnapshotRepository inMemoryRepo() {
        Map<String, MarketDataSnapshot> store = new HashMap<>();
        MarketDataSnapshotRepository repo = Mockito.mock(MarketDataSnapshotRepository.class);

        Mockito.when(repo.findByTicker(Mockito.anyString()))
                .thenAnswer(inv -> Optional.ofNullable(store.get(inv.getArgument(0))));

        Mockito.when(repo.save(Mockito.any(MarketDataSnapshot.class)))
                .thenAnswer(inv -> {
                    MarketDataSnapshot s = inv.getArgument(0);
                    if (s.getId() == null) {
                        s.setId(UUID.randomUUID());
                    }
                    store.put(s.getTicker(), s);
                    return s;
                });

        Mockito.when(repo.findAll())
                .thenAnswer(inv -> new ArrayList<>(store.values()));

        return repo;
    }

    private static MarketDataSnapshot buildSnapshot(String ticker, Instant cachedAt) {
        MarketDataSnapshot s = new MarketDataSnapshot();
        s.setId(UUID.randomUUID());
        s.setTicker(ticker);
        s.setPrice(new BigDecimal("100.00"));
        s.setCurrency("USD");
        s.setTimestamp(Instant.now());
        s.setSource(MarketDataSource.YAHOO);
        s.setStale(false);
        s.setCachedAt(cachedAt);
        return s;
    }

    // Validates: Requirements 7.8
    @Property(tries = 50)
    void oldSnapshotIsMarkedStale(@ForAll("maxAges") Duration maxAge) {
        MarketDataSnapshotRepository repo = inMemoryRepo();
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        // Insert a snapshot that is older than maxAge
        Instant oldCachedAt = Instant.now().minus(maxAge).minusSeconds(10);
        MarketDataSnapshot oldSnapshot = buildSnapshot("STALE", oldCachedAt);
        repo.save(oldSnapshot);

        service.markStaleIfOlderThan(maxAge);

        Optional<MarketDataSnapshot> result = repo.findByTicker("STALE");
        assertThat(result).isPresent();
        assertThat(result.get().isStale()).isTrue();
    }

    // Validates: Requirements 7.8
    @Property(tries = 50)
    void freshSnapshotIsNotMarkedStale(@ForAll("maxAges") Duration maxAge) {
        MarketDataSnapshotRepository repo = inMemoryRepo();
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        // Insert a snapshot that was just cached (well within maxAge)
        MarketDataSnapshot freshSnapshot = buildSnapshot("FRESH", Instant.now());
        repo.save(freshSnapshot);

        service.markStaleIfOlderThan(maxAge);

        Optional<MarketDataSnapshot> result = repo.findByTicker("FRESH");
        assertThat(result).isPresent();
        assertThat(result.get().isStale()).isFalse();
    }

    @Provide
    Arbitrary<Duration> maxAges() {
        // Arbitrary durations between 1 minute and 24 hours (in seconds)
        return Arbitraries.longs()
                .between(60L, 86_400L)
                .map(Duration::ofSeconds);
    }
}
