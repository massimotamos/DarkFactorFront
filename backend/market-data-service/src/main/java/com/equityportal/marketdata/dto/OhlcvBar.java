package com.equityportal.marketdata.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OhlcvBar(
        LocalDate date,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        long volume
) {}
