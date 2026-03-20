package com.equityportal.marketdata.event;

import com.equityportal.persistence.entity.MarketDataSnapshot;
import org.springframework.context.ApplicationEvent;

public class MarketDataUpdatedEvent extends ApplicationEvent {

    private final MarketDataSnapshot snapshot;

    public MarketDataUpdatedEvent(Object source, MarketDataSnapshot snapshot) {
        super(source);
        this.snapshot = snapshot;
    }

    public MarketDataSnapshot getSnapshot() {
        return snapshot;
    }
}
