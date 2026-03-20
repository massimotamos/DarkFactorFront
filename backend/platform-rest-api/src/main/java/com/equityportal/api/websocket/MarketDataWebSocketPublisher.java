package com.equityportal.api.websocket;

import com.equityportal.marketdata.event.MarketDataUpdatedEvent;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class MarketDataWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public MarketDataWebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void onMarketDataUpdated(MarketDataUpdatedEvent event) {
        MarketDataSnapshot snapshot = event.getSnapshot();
        PriceUpdateMessage message = new PriceUpdateMessage(
                snapshot.getTicker(),
                snapshot.getPrice(),
                snapshot.getCurrency(),
                snapshot.getTimestamp(),
                snapshot.isStale()
        );
        messagingTemplate.convertAndSend("/topic/prices/" + snapshot.getTicker(), message);
    }
}
