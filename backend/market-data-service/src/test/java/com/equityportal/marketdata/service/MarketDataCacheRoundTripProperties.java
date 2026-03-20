package com.equityportal.marketdata.service;

import com.equityportal.marketdata.client.AlphaVantageClient;
import com.equityportal.marketdata.client.YahooFinanceClient;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.equityportal.persistence.repository.MarketDataSnapshotRepository;
import net.jqwik.api.*;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// Feature: equity-trading-portal, Property 23: Market data cache round-trip
class MarketDataCacheRoundTripProperties {

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

    @Property(tries = 50)
    void cacheRoundTripPreservesQuoteFields(
            @ForAll("validTickers") String ticker,
            @ForAll("positivePrices") BigDecimal price,
            @ForAll("currencies") String currency,
            @ForAll("timestamps") Instant timestamp
    ) {
        MarketDataSnapshotRepository repo = inMemoryRepo();
        YahooFinanceClient yahooClient = Mockito.mock(YahooFinanceClient.class);
        AlphaVantageClient alphaClient = Mockito.mock(AlphaVantageClient.class);

        MarketDataIngestionService service = new MarketDataIngestionService(
                yahooClient, alphaClient, repo, "AAPL",
                Mockito.mock(ApplicationEventPublisher.class));

        QuoteDto quote = new QuoteDto(ticker, price, currency, timestamp);

        service.upsertSnapshot(quote, MarketDataSource.YAHOO);

        Optional<MarketDataSnapshot> result = service.getSnapshot(ticker);

        assertThat(result).isPresent();
        MarketDataSnapshot snapshot = result.get();

        assertThat(snapshot.getTicker()).isEqualTo(ticker);
        assertThat(snapshot.getPrice()).isEqualByComparingTo(price);
        assertThat(snapshot.getCurrency()).isEqualTo(currency);
        assertThat(snapshot.isStale()).isFalse();
        assertThat(snapshot.getCachedAt()).isNotNull();
    }

    // Validates: Requirements 5.7

    @Provide
    Arbitrary<String> validTickers() {
        return Arbitraries.strings()
                .withCharRange('A', 'Z')
                .ofMinLength(1)
                .ofMaxLength(5);
    }

    @Provide
    Arbitrary<BigDecimal> positivePrices() {
        return Arbitraries.bigDecimals()
                .between(new BigDecimal("0.01"), new BigDecimal("99999.99"))
                .ofScale(2);
    }

    @Provide
    Arbitrary<String> currencies() {
        return Arbitraries.of("USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF");
    }

    @Provide
    Arbitrary<Instant> timestamps() {
        long now = Instant.now().getEpochSecond();
        return Arbitraries.longs()
                .between(now - 86_400L, now)
                .map(Instant::ofEpochSecond);
    }
}
