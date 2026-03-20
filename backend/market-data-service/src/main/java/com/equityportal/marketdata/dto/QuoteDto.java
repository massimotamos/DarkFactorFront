package com.equityportal.marketdata.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record QuoteDto(
        String ticker,
        BigDecimal price,
        String currency,
        Instant timestamp
) {}
