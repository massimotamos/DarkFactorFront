package com.equityportal.persistence.entity;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Validates AllocationLine entity structure.
 * Catches the duplicate portfolio_id field bug where a plain @Column field
 * conflicted with the @JoinColumn managed by the parent @OneToMany.
 */
class AllocationLineEntityTest {

    @Test
    void allocationLine_doesNotHavePortfolioIdField() {
        List<String> fieldNames = Arrays.stream(AllocationLine.class.getDeclaredFields())
                .map(Field::getName)
                .collect(Collectors.toList());

        assertThat(fieldNames)
                .as("AllocationLine must NOT have a portfolioId field — " +
                    "the FK is managed by PortfolioRecommendation @JoinColumn. " +
                    "Having both causes null constraint violations on insert.")
                .doesNotContain("portfolioId");
    }

    @Test
    void allocationLine_hasRequiredFields() {
        List<String> fieldNames = Arrays.stream(AllocationLine.class.getDeclaredFields())
                .map(Field::getName)
                .collect(Collectors.toList());

        assertThat(fieldNames).contains("id", "instrumentId", "weightPercent", "priceAtGeneration");
    }

    @Test
    void allocationLine_canBeConstructedAndPopulated() {
        AllocationLine line = new AllocationLine();
        UUID instrumentId = UUID.randomUUID();
        line.setId(UUID.randomUUID());
        line.setInstrumentId(instrumentId);
        line.setWeightPercent(new BigDecimal("25.00"));
        line.setPriceAtGeneration(new BigDecimal("150.00"));

        assertThat(line.getInstrumentId()).isEqualTo(instrumentId);
        assertThat(line.getWeightPercent()).isEqualByComparingTo(new BigDecimal("25.00"));
        assertThat(line.getPriceAtGeneration()).isEqualByComparingTo(new BigDecimal("150.00"));
    }
}
