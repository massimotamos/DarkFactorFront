package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "allocation_line")
public class AllocationLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private PortfolioRecommendation portfolio;

    @Column(name = "instrument_id", nullable = false)
    private UUID instrumentId;

    @Column(name = "weight_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightPercent;

    @Column(name = "price_at_generation", nullable = false, precision = 18, scale = 6)
    private BigDecimal priceAtGeneration;

    public AllocationLine() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public PortfolioRecommendation getPortfolio() { return portfolio; }
    public void setPortfolio(PortfolioRecommendation portfolio) { this.portfolio = portfolio; }

    public UUID getInstrumentId() { return instrumentId; }
    public void setInstrumentId(UUID instrumentId) { this.instrumentId = instrumentId; }

    public BigDecimal getWeightPercent() { return weightPercent; }
    public void setWeightPercent(BigDecimal weightPercent) { this.weightPercent = weightPercent; }

    public BigDecimal getPriceAtGeneration() { return priceAtGeneration; }
    public void setPriceAtGeneration(BigDecimal priceAtGeneration) { this.priceAtGeneration = priceAtGeneration; }
}
