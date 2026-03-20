package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "derivative_overlay")
public class DerivativeOverlay {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @OneToMany(mappedBy = "overlay", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DerivativePosition> positions = new ArrayList<>();

    public DerivativeOverlay() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPortfolioId() { return portfolioId; }
    public void setPortfolioId(UUID portfolioId) { this.portfolioId = portfolioId; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public List<DerivativePosition> getPositions() { return positions; }
    public void setPositions(List<DerivativePosition> positions) {
        this.positions.clear();
        if (positions != null) {
            for (DerivativePosition p : positions) {
                p.setOverlay(this);
                this.positions.add(p);
            }
        }
    }
}
