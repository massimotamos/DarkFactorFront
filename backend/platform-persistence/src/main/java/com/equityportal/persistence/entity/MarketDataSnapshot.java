package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "market_data_snapshot")
public class MarketDataSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "ticker", nullable = false, unique = true)
    private String ticker;

    @Column(name = "price", nullable = false, precision = 18, scale = 6)
    private BigDecimal price;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private MarketDataSource source;

    @Column(name = "is_stale", nullable = false)
    private boolean isStale;

    @Column(name = "cached_at", nullable = false)
    private Instant cachedAt;

    public MarketDataSnapshot() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public MarketDataSource getSource() { return source; }
    public void setSource(MarketDataSource source) { this.source = source; }

    public boolean isStale() { return isStale; }
    public void setStale(boolean stale) { isStale = stale; }

    public Instant getCachedAt() { return cachedAt; }
    public void setCachedAt(Instant cachedAt) { this.cachedAt = cachedAt; }
}
