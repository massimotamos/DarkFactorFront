package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "derivative_position")
public class DerivativePosition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "overlay_id", nullable = false)
    private UUID overlayId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private DerivativeType type;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "estimated_cost_percent", nullable = false, precision = 6, scale = 2)
    private BigDecimal estimatedCostPercent;

    @Column(name = "max_loss_reduction_percent", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxLossReductionPercent;

    @Column(name = "spot_price", precision = 18, scale = 6)
    private BigDecimal spotPrice;

    @Column(name = "strike_price", precision = 18, scale = 6)
    private BigDecimal strikePrice;

    @Column(name = "implied_volatility", precision = 8, scale = 6)
    private BigDecimal impliedVolatility;

    @Column(name = "risk_free_rate", precision = 8, scale = 6)
    private BigDecimal riskFreeRate;

    @Column(name = "time_to_expiry_years", precision = 8, scale = 6)
    private BigDecimal timeToExpiryYears;

    @Column(name = "notice")
    private String notice;

    public DerivativePosition() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getOverlayId() { return overlayId; }
    public void setOverlayId(UUID overlayId) { this.overlayId = overlayId; }

    public DerivativeType getType() { return type; }
    public void setType(DerivativeType type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getEstimatedCostPercent() { return estimatedCostPercent; }
    public void setEstimatedCostPercent(BigDecimal estimatedCostPercent) { this.estimatedCostPercent = estimatedCostPercent; }

    public BigDecimal getMaxLossReductionPercent() { return maxLossReductionPercent; }
    public void setMaxLossReductionPercent(BigDecimal maxLossReductionPercent) { this.maxLossReductionPercent = maxLossReductionPercent; }

    public BigDecimal getSpotPrice() { return spotPrice; }
    public void setSpotPrice(BigDecimal spotPrice) { this.spotPrice = spotPrice; }

    public BigDecimal getStrikePrice() { return strikePrice; }
    public void setStrikePrice(BigDecimal strikePrice) { this.strikePrice = strikePrice; }

    public BigDecimal getImpliedVolatility() { return impliedVolatility; }
    public void setImpliedVolatility(BigDecimal impliedVolatility) { this.impliedVolatility = impliedVolatility; }

    public BigDecimal getRiskFreeRate() { return riskFreeRate; }
    public void setRiskFreeRate(BigDecimal riskFreeRate) { this.riskFreeRate = riskFreeRate; }

    public BigDecimal getTimeToExpiryYears() { return timeToExpiryYears; }
    public void setTimeToExpiryYears(BigDecimal timeToExpiryYears) { this.timeToExpiryYears = timeToExpiryYears; }

    public String getNotice() { return notice; }
    public void setNotice(String notice) { this.notice = notice; }
}
