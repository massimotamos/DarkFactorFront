package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "portfolio_recommendation")
public class PortfolioRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @Column(name = "expected_return_percent", nullable = false, precision = 6, scale = 2)
    private BigDecimal expectedReturnPercent;

    @Column(name = "volatility_percent", nullable = false, precision = 6, scale = 2)
    private BigDecimal volatilityPercent;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AllocationLine> allocations = new ArrayList<>();

    @Transient
    private String dataWarning;

    public PortfolioRecommendation() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public BigDecimal getExpectedReturnPercent() { return expectedReturnPercent; }
    public void setExpectedReturnPercent(BigDecimal expectedReturnPercent) { this.expectedReturnPercent = expectedReturnPercent; }

    public BigDecimal getVolatilityPercent() { return volatilityPercent; }
    public void setVolatilityPercent(BigDecimal volatilityPercent) { this.volatilityPercent = volatilityPercent; }

    public List<AllocationLine> getAllocations() { return allocations; }
    public void setAllocations(List<AllocationLine> allocations) {
        this.allocations.clear();
        if (allocations != null) {
            for (AllocationLine line : allocations) {
                line.setPortfolio(this);
                this.allocations.add(line);
            }
        }
    }

    public String getDataWarning() { return dataWarning; }
    public void setDataWarning(String dataWarning) { this.dataWarning = dataWarning; }
}
