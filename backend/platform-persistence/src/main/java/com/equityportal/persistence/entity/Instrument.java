package com.equityportal.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "instrument")
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "ticker", nullable = false, unique = true)
    private String ticker;

    @Column(name = "isin")
    private String isin;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_class", nullable = false)
    private AssetClass assetClass;

    @Column(name = "exchange")
    private String exchange;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "region", nullable = false)
    private RegionalPreference region;

    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated;

    public Instrument() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getIsin() { return isin; }
    public void setIsin(String isin) { this.isin = isin; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AssetClass getAssetClass() { return assetClass; }
    public void setAssetClass(AssetClass assetClass) { this.assetClass = assetClass; }

    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public RegionalPreference getRegion() { return region; }
    public void setRegion(RegionalPreference region) { this.region = region; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}
