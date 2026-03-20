package com.equityportal.marketdata.serializer;

import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import net.jqwik.api.*;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property 27: MarketDataSnapshot serialisation round-trip
 * Validates: Requirements 9.1, 9.2, 9.4, 9.5
 */
class MarketDataSnapshotSerializerRoundTripProperties {

    private final MarketDataSnapshotSerializer serializer;

    MarketDataSnapshotSerializerRoundTripProperties() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.serializer = new MarketDataSnapshotSerializer(mapper);
    }

    /**
     * Property 27: MarketDataSnapshot serialisation round-trip
     *
     * For any valid MarketDataSnapshot, serialising to JSON and deserialising back
     * must preserve ticker, price, currency, timestamp, and isStale exactly.
     *
     * Validates: Requirements 9.1, 9.2, 9.4, 9.5
     */
    @Property(tries = 50)
    void serializationRoundTripPreservesAllFields(
            @ForAll("validSnapshots") MarketDataSnapshot snapshot) {

        String json = serializer.serialize(snapshot);
        MarketDataSnapshot result = serializer.deserialize(json);

        assertThat(result.getTicker())
                .isEqualTo(snapshot.getTicker());

        assertThat(result.getPrice())
                .isEqualByComparingTo(snapshot.getPrice());

        assertThat(result.getCurrency())
                .isEqualTo(snapshot.getCurrency());

        assertThat(result.getTimestamp())
                .isEqualTo(snapshot.getTimestamp());

        assertThat(result.isStale())
                .isEqualTo(snapshot.isStale());
    }

    @Provide
    Arbitrary<MarketDataSnapshot> validSnapshots() {
        Arbitrary<String> tickers = Arbitraries.strings()
                .withCharRange('A', 'Z')
                .ofMinLength(1)
                .ofMaxLength(5);

        Arbitrary<BigDecimal> prices = Arbitraries.bigDecimals()
                .between(BigDecimal.valueOf(0.01), BigDecimal.valueOf(1_000_000))
                .ofScale(6);

        Arbitrary<String> currencies = Arbitraries.of("USD", "EUR", "GBP", "JPY", "CAD");

        // Epoch-second precision to avoid sub-millisecond truncation issues
        Arbitrary<Instant> instants = Arbitraries.longs()
                .between(0L, 4_102_444_800L)  // 1970-01-01 to 2100-01-01
                .map(Instant::ofEpochSecond);

        Arbitrary<MarketDataSource> sources = Arbitraries.of(MarketDataSource.values());

        Arbitrary<Boolean> staleFlags = Arbitraries.of(true, false);

        return Combinators.combine(tickers, prices, currencies, instants, instants, sources, staleFlags)
                .as((ticker, price, currency, timestamp, cachedAt, source, isStale) -> {
                    MarketDataSnapshot s = new MarketDataSnapshot();
                    s.setTicker(ticker);
                    s.setPrice(price);
                    s.setCurrency(currency);
                    s.setTimestamp(timestamp);
                    s.setCachedAt(cachedAt);
                    s.setSource(source);
                    s.setStale(isStale);
                    return s;
                });
    }
}
