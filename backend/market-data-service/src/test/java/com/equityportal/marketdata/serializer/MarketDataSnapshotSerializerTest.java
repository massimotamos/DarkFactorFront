package com.equityportal.marketdata.serializer;

import com.equityportal.marketdata.exception.InvalidMarketDataException;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.entity.MarketDataSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class MarketDataSnapshotSerializerTest {

    private MarketDataSnapshotSerializer serializer;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        serializer = new MarketDataSnapshotSerializer(mapper);
    }

    private MarketDataSnapshot buildSnapshot() {
        MarketDataSnapshot s = new MarketDataSnapshot();
        s.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        s.setTicker("AAPL");
        s.setPrice(new BigDecimal("182.50"));
        s.setCurrency("USD");
        s.setTimestamp(Instant.parse("2024-01-15T10:00:00Z"));
        s.setSource(MarketDataSource.YAHOO);
        s.setStale(false);
        s.setCachedAt(Instant.parse("2024-01-15T10:00:01Z"));
        return s;
    }

    // --- serialize ---

    @Test
    void serialize_producesValidJson() {
        String json = serializer.serialize(buildSnapshot());
        assertThat(json).contains("\"ticker\":\"AAPL\"");
        assertThat(json).contains("\"price\":182.50");
    }

    @Test
    void serialize_isCompact_noNewlines() {
        String json = serializer.serialize(buildSnapshot());
        assertThat(json).doesNotContain("\n");
    }

    @Test
    void serialize_timestampAsIsoString() {
        String json = serializer.serialize(buildSnapshot());
        assertThat(json).contains("2024-01-15T10:00:00Z");
    }

    // --- prettyPrint ---

    @Test
    void prettyPrint_containsNewlines() {
        String json = serializer.prettyPrint(buildSnapshot());
        assertThat(json).contains("\n");
    }

    @Test
    void prettyPrint_containsExpectedFields() {
        String json = serializer.prettyPrint(buildSnapshot());
        assertThat(json).contains("\"ticker\" : \"AAPL\"");
        assertThat(json).contains("2024-01-15T10:00:00Z");
    }

    // --- deserialize ---

    @Test
    void deserialize_roundTrip_returnsEquivalentSnapshot() {
        MarketDataSnapshot original = buildSnapshot();
        String json = serializer.serialize(original);
        MarketDataSnapshot result = serializer.deserialize(json);

        assertThat(result.getTicker()).isEqualTo("AAPL");
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("182.50"));
        assertThat(result.getTimestamp()).isEqualTo(Instant.parse("2024-01-15T10:00:00Z"));
        assertThat(result.getCurrency()).isEqualTo("USD");
    }

    @Test
    void deserialize_missingTicker_throwsInvalidMarketDataException() {
        String json = "{\"price\":100.0,\"timestamp\":\"2024-01-15T10:00:00Z\"}";
        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class)
                .hasMessageContaining("ticker");
    }

    @Test
    void deserialize_emptyTicker_throwsInvalidMarketDataException() {
        String json = "{\"ticker\":\"\",\"price\":100.0,\"timestamp\":\"2024-01-15T10:00:00Z\"}";
        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class)
                .hasMessageContaining("ticker");
    }

    @Test
    void deserialize_blankTicker_throwsInvalidMarketDataException() {
        String json = "{\"ticker\":\"   \",\"price\":100.0,\"timestamp\":\"2024-01-15T10:00:00Z\"}";
        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class)
                .hasMessageContaining("ticker");
    }

    @Test
    void deserialize_missingPrice_throwsInvalidMarketDataException() {
        String json = "{\"ticker\":\"AAPL\",\"timestamp\":\"2024-01-15T10:00:00Z\"}";
        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class)
                .hasMessageContaining("price");
    }

    @Test
    void deserialize_missingTimestamp_throwsInvalidMarketDataException() {
        String json = "{\"ticker\":\"AAPL\",\"price\":100.0}";
        assertThatThrownBy(() -> serializer.deserialize(json))
                .isInstanceOf(InvalidMarketDataException.class)
                .hasMessageContaining("timestamp");
    }

    @Test
    void deserialize_invalidJson_throwsInvalidMarketDataException() {
        assertThatThrownBy(() -> serializer.deserialize("not-json"))
                .isInstanceOf(InvalidMarketDataException.class);
    }
}
