package com.equityportal.marketdata.service;

import com.equityportal.marketdata.client.AlphaVantageClient;
import com.equityportal.marketdata.client.YahooFinanceClient;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;
import com.equityportal.marketdata.exception.TickerNotFoundException;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.equityportal.persistence.repository.MarketDataSnapshotRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for market-data-service covering:
 * - Provider failover after 30 s primary unavailability (Requirement 5.5)
 * - Cache staleness marking (Requirement 5.6)
 * - Ticker not found → TickerNotFoundException (Requirement 5.8)
 * - Date range > 5 years → IllegalArgumentException (Requirement 5.8)
 */
class MarketDataServiceUnitTest {

    // -------------------------------------------------------------------------
    // Helper: in-memory repository stub
    // -------------------------------------------------------------------------

    private static MarketDataSnapshotRepository inMemoryRepo() {
        Map<String, MarketDataSnapshot> store = new HashMap<>();
        MarketDataSnapshotRepository repo = Mockito.mock(MarketDataSnapshotRepository.class);

        when(repo.findByTicker(anyString()))
                .thenAnswer(inv -> Optional.ofNullable(store.get(inv.getArgument(0))));

        when(repo.save(Mockito.any(MarketDataSnapshot.class)))
                .thenAnswer(inv -> {
                    MarketDataSnapshot s = inv.getArgument(0);
                    if (s.getId() == null) {
                        s.setId(UUID.randomUUID());
                    }
                    store.put(s.getTicker(), s);
                    return s;
                });

        when(repo.findAll())
                .thenAnswer(inv -> new ArrayList<>(store.values()));

        return repo;
    }

    private static MarketDataSnapshot buildSnapshot(String ticker, Instant cachedAt) {
        MarketDataSnapshot s = new MarketDataSnapshot();
        s.setId(UUID.randomUUID());
        s.setTicker(ticker);
        s.setPrice(new BigDecimal("150.00"));
        s.setCurrency("USD");
        s.setTimestamp(Instant.now());
        s.setSource(MarketDataSource.YAHOO);
        s.setStale(false);
        s.setCachedAt(cachedAt);
        return s;
    }

    // -------------------------------------------------------------------------
    // Test 1: Provider failover — switches to Alpha Vantage after 30 s
    // Requirements: 5.5
    // -------------------------------------------------------------------------

    @Test
    void providerFailover_switchesToAlphaVantageAfter30s() throws Exception {
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);
        MarketDataSnapshotRepository repo = inMemoryRepo();

        // Yahoo always throws unavailable
        when(yahooClient.fetchQuote(anyString()))
                .thenThrow(new MarketDataUnavailableException("Yahoo Finance is down"));

        // Alpha Vantage returns a valid quote
        QuoteDto alphaQuote = new QuoteDto("AAPL", new BigDecimal("175.00"), "USD", Instant.now());
        when(alphaClient.fetchQuote(anyString())).thenReturn(alphaQuote);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        // Simulate that primary has been unavailable for 31 seconds via reflection
        Field field = MarketDataIngestionService.class.getDeclaredField("primaryUnavailableSince");
        field.setAccessible(true);
        field.set(service, Instant.now().minusSeconds(31));

        service.pollAll();

        // Alpha Vantage should have been called after the 30 s threshold
        verify(alphaClient).fetchQuote("AAPL");
    }

    // -------------------------------------------------------------------------
    // Test 2: Cache staleness — markStaleIfOlderThan
    // Requirements: 5.6
    // -------------------------------------------------------------------------

    @Test
    void cacheStaleness_markStaleIfOlderThan() {
        MarketDataSnapshotRepository repo = inMemoryRepo();
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        // Insert a snapshot cached 2 minutes ago
        Instant twoMinutesAgo = Instant.now().minus(Duration.ofMinutes(2));
        MarketDataSnapshot oldSnapshot = buildSnapshot("STALE_TICKER", twoMinutesAgo);
        repo.save(oldSnapshot);

        // Insert a fresh snapshot (just now)
        MarketDataSnapshot freshSnapshot = buildSnapshot("FRESH_TICKER", Instant.now());
        repo.save(freshSnapshot);

        // Mark stale if older than 1 minute
        service.markStaleIfOlderThan(Duration.ofMinutes(1));

        // Old snapshot should be stale
        Optional<MarketDataSnapshot> staleResult = repo.findByTicker("STALE_TICKER");
        assertThat(staleResult).isPresent();
        assertThat(staleResult.get().isStale()).isTrue();

        // Fresh snapshot should remain non-stale
        Optional<MarketDataSnapshot> freshResult = repo.findByTicker("FRESH_TICKER");
        assertThat(freshResult).isPresent();
        assertThat(freshResult.get().isStale()).isFalse();
    }

    // -------------------------------------------------------------------------
    // Test 3: Ticker not found — exception caught internally, no propagation
    // Requirements: 5.8
    // -------------------------------------------------------------------------

    @Test
    void tickerNotFound_exceptionCaughtInternally_doesNotPropagate() {
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);
        MarketDataSnapshotRepository repo = inMemoryRepo();

        // Yahoo throws TickerNotFoundException for the unknown ticker
        when(yahooClient.fetchQuote("UNKNOWN"))
                .thenThrow(new TickerNotFoundException("UNKNOWN"));

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "UNKNOWN",
                Mockito.mock(ApplicationEventPublisher.class));

        // pollAll() must not propagate the TickerNotFoundException
        // If this call completes without throwing, the exception was handled correctly
        service.pollAll();

        // Verify Yahoo was called and no snapshot was stored (exception was swallowed)
        verify(yahooClient).fetchQuote("UNKNOWN");
        assertThat(repo.findByTicker("UNKNOWN")).isEmpty();
    }

    // -------------------------------------------------------------------------
    // Test 4: Date range > 5 years → IllegalArgumentException
    // Requirements: 5.8
    // -------------------------------------------------------------------------

    @Test
    void dateRangeOver5Years_throwsIllegalArgumentException() {
        MarketDataSnapshotRepository repo = inMemoryRepo();
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        LocalDate from = LocalDate.of(2015, 1, 1);
        LocalDate to = LocalDate.of(2021, 1, 2); // > 1826 days

        assertThatThrownBy(() -> service.fetchHistory("AAPL", from, to))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("5 years");
    }
}
