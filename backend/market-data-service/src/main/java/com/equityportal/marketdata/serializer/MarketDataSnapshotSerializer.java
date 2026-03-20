package com.equityportal.marketdata.serializer;

import com.equityportal.marketdata.exception.InvalidMarketDataException;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class MarketDataSnapshotSerializer {

    private final ObjectMapper objectMapper;

    public MarketDataSnapshotSerializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Serialises a {@link MarketDataSnapshot} to compact JSON.
     */
    public String serialize(MarketDataSnapshot snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize MarketDataSnapshot", e);
        }
    }

    /**
     * Serialises a {@link MarketDataSnapshot} to pretty-printed JSON.
     */
    public String prettyPrint(MarketDataSnapshot snapshot) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to pretty-print MarketDataSnapshot", e);
        }
    }

    /**
     * Deserialises a {@link MarketDataSnapshot} from JSON.
     * Validates that {@code ticker}, {@code price}, and {@code timestamp} are present.
     *
     * @throws InvalidMarketDataException if any required field is missing or blank
     */
    public MarketDataSnapshot deserialize(String json) {
        MarketDataSnapshot snapshot;
        try {
            snapshot = objectMapper.readValue(json, MarketDataSnapshot.class);
        } catch (JsonProcessingException e) {
            throw new InvalidMarketDataException("Failed to deserialize MarketDataSnapshot: " + e.getMessage(), e);
        }

        if (snapshot.getTicker() == null || snapshot.getTicker().isBlank()) {
            throw new InvalidMarketDataException("Required field 'ticker' is missing or empty");
        }
        if (snapshot.getPrice() == null) {
            throw new InvalidMarketDataException("Required field 'price' is missing");
        }
        if (snapshot.getTimestamp() == null) {
            throw new InvalidMarketDataException("Required field 'timestamp' is missing");
        }

        return snapshot;
    }
}
