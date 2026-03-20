package com.equityportal.marketdata.serializer;

import com.equityportal.marketdata.exception.InvalidMarketDataException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import net.jqwik.api.*;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Property 28: Incomplete JSON market data payload rejected
 * Validates: Requirements 9.3
 */
class MarketDataSnapshotSerializerIncompletePayloadProperties {

    private final MarketDataSnapshotSerializer serializer;

    MarketDataSnapshotSerializerIncompletePayloadProperties() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.serializer = new MarketDataSnapshotSerializer(mapper);
    }

    /**
     * Property 28a: JSON missing ticker (or with empty/blank ticker) is rejected.
     *
     * Validates: Requirements 9.3
     */
    @Property(tries = 50)
    void missingTickerRejected(
            @ForAll("validPrices") BigDecimal price,
            @ForAll("validInstants") Instant timestamp,
            @ForAll("blankOrAbsentTicker") String tickerFragment) {

        String json = tickerFragment.isEmpty()
                ? String.format("{\"price\":%s,\"timestamp\":\"%s\"}", price, timestamp)
                : String.format("{\"ticker\":\"%s\",\"price\":%s,\"timestamp\":\"%s\"}", tickerFragment, price, timestamp);

        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class);
    }

    /**
     * Property 28b: JSON missing price field is rejected.
     *
     * Validates: Requirements 9.3
     */
    @Property(tries = 50)
    void missingPriceRejected(
            @ForAll("validTickers") String ticker,
            @ForAll("validInstants") Instant timestamp) {

        String json = String.format("{\"ticker\":\"%s\",\"timestamp\":\"%s\"}", ticker, timestamp);

        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class);
    }

    /**
     * Property 28c: JSON missing timestamp field is rejected.
     *
     * Validates: Requirements 9.3
     */
    @Property(tries = 50)
    void missingTimestampRejected(
            @ForAll("validTickers") String ticker,
            @ForAll("validPrices") BigDecimal price) {

        String json = String.format("{\"ticker\":\"%s\",\"price\":%s}", ticker, price);

        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class);
    }

    @Provide
    Arbitrary<String> validTickers() {
        return Arbitraries.strings()
                .withCharRange('A', 'Z')
                .ofMinLength(1)
                .ofMaxLength(5);
    }

    @Provide
    Arbitrary<BigDecimal> validPrices() {
        return Arbitraries.bigDecimals()
                .between(BigDecimal.valueOf(0.01), BigDecimal.valueOf(1_000_000))
                .ofScale(6);
    }

    @Provide
    Arbitrary<Instant> validInstants() {
        return Arbitraries.longs()
                .between(0L, 4_102_444_800L)
                .map(Instant::ofEpochSecond);
    }

    /**
     * Generates blank/whitespace-only strings (to be used as invalid ticker values),
     * or an empty string sentinel meaning "omit the ticker field entirely".
     */
    @Provide
    Arbitrary<String> blankOrAbsentTicker() {
        // empty string = omit field; whitespace strings = blank ticker value
        Arbitrary<String> absent = Arbitraries.just("");
        Arbitrary<String> blank = Arbitraries.strings()
                .withChars(' ', '\t', '\n')
                .ofMinLength(1)
                .ofMaxLength(5);
        return Arbitraries.oneOf(absent, blank);
    }
}
