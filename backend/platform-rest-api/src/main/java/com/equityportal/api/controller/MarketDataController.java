package com.equityportal.api.controller;

import com.equityportal.marketdata.dto.OhlcvBar;
import com.equityportal.marketdata.service.MarketDataIngestionService;
import com.equityportal.persistence.entity.Instrument;
import com.equityportal.persistence.entity.MarketDataSnapshot;
import com.equityportal.persistence.repository.InstrumentRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    private final MarketDataIngestionService ingestionService;
    private final InstrumentRepository instrumentRepository;

    public MarketDataController(MarketDataIngestionService ingestionService,
                                InstrumentRepository instrumentRepository) {
        this.ingestionService = ingestionService;
        this.instrumentRepository = instrumentRepository;
    }

    @GetMapping("/quote/{ticker}")
    public ResponseEntity<Map<String, Object>> getQuote(@PathVariable String ticker) {
        return ingestionService.getSnapshot(ticker)
                .map(s -> ResponseEntity.ok(snapshotToMap(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{ticker}")
    public ResponseEntity<List<OhlcvBar>> getHistory(
            @PathVariable String ticker,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<OhlcvBar> bars = ingestionService.fetchHistory(ticker, from, to);
        return ResponseEntity.ok(bars);
    }

    @GetMapping("/reference/{ticker}")
    public ResponseEntity<Map<String, Object>> getReference(@PathVariable String ticker) {
        return instrumentRepository.findByTicker(ticker)
                .map(i -> ResponseEntity.ok(instrumentToMap(i)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> snapshotToMap(MarketDataSnapshot s) {
        var m = new java.util.LinkedHashMap<String, Object>();
        m.put("ticker", s.getTicker());
        m.put("price", s.getPrice());
        m.put("currency", s.getCurrency());
        m.put("timestamp", s.getTimestamp());
        m.put("stale", s.isStale());
        m.put("cachedAt", s.getCachedAt());
        return m;
    }

    private Map<String, Object> instrumentToMap(Instrument i) {
        return Map.of(
                "id", i.getId(),
                "ticker", i.getTicker(),
                "name", i.getName(),
                "assetClass", i.getAssetClass(),
                "region", i.getRegion(),
                "currency", i.getCurrency()
        );
    }
}
