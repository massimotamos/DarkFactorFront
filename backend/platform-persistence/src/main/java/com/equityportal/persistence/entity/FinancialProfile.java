package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "financial_profile")
public class FinancialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_tolerance", nullable = false)
    private RiskTolerance riskTolerance;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience", nullable = false)
    private InvestmentExperience experience;

    @Enumerated(EnumType.STRING)
    @Column(name = "income_bracket", nullable = false)
    private IncomeBracket incomeBracket;

    @Enumerated(EnumType.STRING)
    @Column(name = "net_worth_band", nullable = false)
    private NetWorthBand netWorthBand;

    @Column(name = "horizon_months", nullable = false)
    private int horizonMonths;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "financial_profile_regions",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "region")
    @Enumerated(EnumType.STRING)
    private Set<RegionalPreference> regions = new HashSet<>();

    @Column(name = "target_roi_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetRoiPercent;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public FinancialProfile() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public RiskTolerance getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(RiskTolerance riskTolerance) { this.riskTolerance = riskTolerance; }

    public InvestmentExperience getExperience() { return experience; }
    public void setExperience(InvestmentExperience experience) { this.experience = experience; }

    public IncomeBracket getIncomeBracket() { return incomeBracket; }
    public void setIncomeBracket(IncomeBracket incomeBracket) { this.incomeBracket = incomeBracket; }

    public NetWorthBand getNetWorthBand() { return netWorthBand; }
    public void setNetWorthBand(NetWorthBand netWorthBand) { this.netWorthBand = netWorthBand; }

    public int getHorizonMonths() { return horizonMonths; }
    public void setHorizonMonths(int horizonMonths) { this.horizonMonths = horizonMonths; }

    public Set<RegionalPreference> getRegions() { return regions; }
    public void setRegions(Set<RegionalPreference> regions) { this.regions = regions; }

    public BigDecimal getTargetRoiPercent() { return targetRoiPercent; }
    public void setTargetRoiPercent(BigDecimal targetRoiPercent) { this.targetRoiPercent = targetRoiPercent; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
