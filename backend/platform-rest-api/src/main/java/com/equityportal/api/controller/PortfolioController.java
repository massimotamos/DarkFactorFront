package com.equityportal.api.controller;

import com.equityportal.persistence.entity.AllocationLine;
import com.equityportal.persistence.entity.PortfolioRecommendation;
import com.equityportal.portfolio.service.PortfolioRecommendationService;
import com.equityportal.portfolio.service.RecommendationHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioRecommendationService recommendationService;
    private final RecommendationHistoryService historyService;

    public PortfolioController(PortfolioRecommendationService recommendationService,
                               RecommendationHistoryService historyService) {
        this.recommendationService = recommendationService;
        this.historyService = historyService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<Map<String, Object>> recommend(@AuthenticationPrincipal UUID userId) {
        PortfolioRecommendation rec = recommendationService.generate(userId);
        return ResponseEntity.ok(toMap(rec));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(@AuthenticationPrincipal UUID userId) {
        List<Map<String, Object>> result = historyService.getHistory(userId)
                .stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<Map<String, Object>> historyById(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        return historyService.getById(id)
                .filter(r -> r.getUserId().equals(userId))
                .map(r -> ResponseEntity.ok(toMap(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(PortfolioRecommendation r) {
        List<Map<String, Object>> allocations = r.getAllocations().stream()
                .map(a -> Map.<String, Object>of(
                        "instrumentId", a.getInstrumentId(),
                        "weightPercent", a.getWeightPercent(),
                        "priceAtGeneration", a.getPriceAtGeneration()
                )).toList();

        var map = new java.util.LinkedHashMap<String, Object>();
        map.put("id", r.getId());
        map.put("userId", r.getUserId());
        map.put("generatedAt", r.getGeneratedAt());
        map.put("expectedReturnPercent", r.getExpectedReturnPercent());
        map.put("volatilityPercent", r.getVolatilityPercent());
        map.put("allocations", allocations);
        if (r.getDataWarning() != null) {
            map.put("dataWarning", r.getDataWarning());
        }
        return map;
    }
}
