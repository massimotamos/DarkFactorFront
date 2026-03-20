package com.equityportal.api.websocket;

import java.math.BigDecimal;
import java.time.Instant;

public record PriceUpdateMessage(
        String ticker,
        BigDecimal price,
        String currency,
        Instant timestamp,
        boolean stale
) {}
