package com.equityportal.marketdata.service;

import com.equityportal.marketdata.client.AlphaVantageClient;
import com.equityportal.marketdata.client.YahooFinanceClient;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.equityportal.persistence.repository.MarketDataSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.equityportal.marketdata.dto.OhlcvBar;
import com.equityportal.marketdata.event.MarketDataUpdatedEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class MarketDataIngestionService {

    private static final Logger log = LoggerFactory.getLogger(MarketDataIngestionService.class);

    private static final long FAILOVER_THRESHOLD_MS = 30_000L;

    private final YahooFinanceClient primaryProvider;
    private final AlphaVantageClient fallbackProvider;
    private final MarketDataSnapshotRepository snapshotRepository;
    private final List<String> tickers;
    private final ApplicationEventPublisher eventPublisher;

    /** Timestamp when the primary provider first became unavailable; null if primary is healthy. */
    private volatile Instant primaryUnavailableSince = null;

    /** Whether we are currently routing to the fallback provider. */
    private volatile boolean usingFallback = false;

    public MarketDataIngestionService(
            YahooFinanceClient primaryProvider,
            AlphaVantageClient fallbackProvider,
            MarketDataSnapshotRepository snapshotRepository,
            @Value("${market-data.tickers:AAPL,MSFT,GOOGL,AMZN,TSLA}") String tickersCsv,
            ApplicationEventPublisher eventPublisher) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
        this.snapshotRepository = snapshotRepository;
        this.tickers = Arrays.asList(tickersCsv.split(","));
        this.eventPublisher = eventPublisher;
    }

    /**
     * Scheduled poll loop. Fetches quotes for all configured tickers and upserts them into the cache.
     * Switches to Alpha Vantage fallback after the primary has been continuously unavailable for ≥ 30 s.
     */
    @Scheduled(fixedDelayString = "${market-data.poll-interval-ms:30000}")
    public void pollAll() {
        for (String ticker : tickers) {
            try {
                pollTicker(ticker.trim());
            } catch (Exception e) {
                log.error("Unexpected error polling ticker {}: {}", ticker, e.getMessage(), e);
            }
        }
    }

    private void pollTicker(String ticker) {
        if (!usingFallback) {
            // Try primary
            try {
                QuoteDto quote = primaryProvider.fetchQuote(ticker);
                // Primary succeeded — reset failure tracking
                if (primaryUnavailableSince != null) {
                    log.info("Primary provider recovered for ticker {}; switching back from fallback", ticker);
                    primaryUnavailableSince = null;
                    usingFallback = false;
                }
                upsertSnapshot(quote, MarketDataSource.YAHOO);
            } catch (MarketDataUnavailableException e) {
                handlePrimaryFailure(ticker, e);
            }
        } else {
            // Already in fallback mode — try primary first to see if it recovered
            try {
                QuoteDto quote = primaryProvider.fetchQuote(ticker);
                log.info("Primary provider recovered; switching back from Alpha Vantage fallback");
                primaryUnavailableSince = null;
                usingFallback = false;
                upsertSnapshot(quote, MarketDataSource.YAHOO);
            } catch (MarketDataUnavailableException primaryEx) {
                // Primary still down — use fallback
                tryFallback(ticker);
            }
        }
    }

    private void handlePrimaryFailure(String ticker, MarketDataUnavailableException e) {
        if (primaryUnavailableSince == null) {
            primaryUnavailableSince = Instant.now();
            log.warn("Primary market data provider unavailable for ticker {}: {}", ticker, e.getMessage());
        }

        long unavailableMs = Duration.between(primaryUnavailableSince, Instant.now()).toMillis();
        if (unavailableMs >= FAILOVER_THRESHOLD_MS) {
            log.warn("Switching to Alpha Vantage fallback after primary unavailability");
            usingFallback = true;
            tryFallback(ticker);
        } else {
            log.debug("Primary unavailable for {} ms (threshold {} ms); not yet switching to fallback",
                    unavailableMs, FAILOVER_THRESHOLD_MS);
        }
    }

    private void tryFallback(String ticker) {
        try {
            QuoteDto quote = fallbackProvider.fetchQuote(ticker);
            // Fallback succeeded — reset primary failure timer so next cycle re-evaluates
            primaryUnavailableSince = null;
            upsertSnapshot(quote, MarketDataSource.ALPHA_VANTAGE);
        } catch (MarketDataUnavailableException fallbackEx) {
            log.error("Both primary and fallback providers unavailable for ticker {}: {}",
                    ticker, fallbackEx.getMessage());
        }
    }

    /**
     * Upsert a {@link MarketDataSnapshot} for the given quote.
     * Updates an existing record if one exists for the ticker, otherwise creates a new one.
     */
    @Transactional
    public void upsertSnapshot(QuoteDto quote, MarketDataSource source) {
        MarketDataSnapshot snapshot = snapshotRepository.findByTicker(quote.ticker())
                .orElseGet(MarketDataSnapshot::new);

        snapshot.setTicker(quote.ticker());
        snapshot.setPrice(quote.price());
        snapshot.setCurrency(quote.currency());
        snapshot.setTimestamp(quote.timestamp());
        snapshot.setSource(source);
        snapshot.setStale(false);
        snapshot.setCachedAt(Instant.now());

        snapshotRepository.save(snapshot);
        eventPublisher.publishEvent(new MarketDataUpdatedEvent(this, snapshot));
    }

    /**
     * Returns the cached {@link MarketDataSnapshot} for the given ticker, if present.
     */
    public Optional<MarketDataSnapshot> getSnapshot(String ticker) {
        return snapshotRepository.findByTicker(ticker);
    }

    /**
     * Fetches historical OHLCV data for the given ticker and date range.
     * Validates that the date range does not exceed 5 years (1826 days).
     *
     * @throws IllegalArgumentException if the date range exceeds 5 years
     */
    public List<OhlcvBar> fetchHistory(String ticker, LocalDate from, LocalDate to) {
        long days = ChronoUnit.DAYS.between(from, to);
        if (days > 1826) {
            throw new IllegalArgumentException(
                    "Date range exceeds maximum of 5 years: requested " + days + " days");
        }
        return primaryProvider.fetchHistory(ticker, from, to);
    }

    /**
     * Marks all snapshots as stale where {@code cachedAt} is older than {@code maxAge}.
     */
    @Transactional
    public void markStaleIfOlderThan(Duration maxAge) {
        Instant cutoff = Instant.now().minus(maxAge);
        List<MarketDataSnapshot> all = snapshotRepository.findAll();
        for (MarketDataSnapshot snapshot : all) {
            if (snapshot.getCachedAt() != null && snapshot.getCachedAt().isBefore(cutoff)) {
                snapshot.setStale(true);
                snapshotRepository.save(snapshot);
            }
        }
    }
}
