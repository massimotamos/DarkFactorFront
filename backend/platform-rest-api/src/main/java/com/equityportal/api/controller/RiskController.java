package com.equityportal.api.controller;

import com.equityportal.persistence.entity.DerivativeOverlay;
import com.equityportal.persistence.entity.DerivativePosition;
import com.equityportal.persistence.entity.FinancialProfile;
import com.equityportal.persistence.entity.PortfolioRecommendation;
import com.equityportal.persistence.repository.DerivativeOverlayRepository;
import com.equityportal.persistence.repository.FinancialProfileRepository;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import com.equityportal.risk.service.DerivativeOverlayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/risk")
public class RiskController {

    private final DerivativeOverlayService overlayService;
    private final DerivativeOverlayRepository overlayRepository;
    private final PortfolioRecommendationRepository portfolioRepository;
    private final FinancialProfileRepository profileRepository;

    public RiskController(DerivativeOverlayService overlayService,
                          DerivativeOverlayRepository overlayRepository,
                          PortfolioRecommendationRepository portfolioRepository,
                          FinancialProfileRepository profileRepository) {
        this.overlayService = overlayService;
        this.overlayRepository = overlayRepository;
        this.portfolioRepository = portfolioRepository;
        this.profileRepository = profileRepository;
    }

    @GetMapping("/overlay/{portfolioId}")
    public ResponseEntity<Map<String, Object>> getOverlay(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID portfolioId) {

        PortfolioRecommendation recommendation = portfolioRepository.findById(portfolioId)
                .filter(r -> r.getUserId().equals(userId))
                .orElse(null);
        if (recommendation == null) {
            return ResponseEntity.notFound().build();
        }

        FinancialProfile profile = profileRepository.findByUserId(userId)
                .orElse(null);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        // Return existing overlay or generate a new one
        DerivativeOverlay overlay = overlayRepository.findByPortfolioId(portfolioId)
                .orElseGet(() -> overlayService.generateOverlay(recommendation, profile));

        return ResponseEntity.ok(toMap(overlay));
    }

    private Map<String, Object> toMap(DerivativeOverlay o) {
        List<Map<String, Object>> positions = o.getPositions().stream()
                .map(p -> {
                    var m = new java.util.LinkedHashMap<String, Object>();
                    m.put("type", p.getType());
                    m.put("description", p.getDescription());
                    m.put("estimatedCostPercent", p.getEstimatedCostPercent());
                    m.put("maxLossReductionPercent", p.getMaxLossReductionPercent());
                    if (p.getSpotPrice() != null) m.put("spotPrice", p.getSpotPrice());
                    if (p.getStrikePrice() != null) m.put("strikePrice", p.getStrikePrice());
                    if (p.getImpliedVolatility() != null) m.put("impliedVolatility", p.getImpliedVolatility());
                    if (p.getNotice() != null) m.put("notice", p.getNotice());
                    return (Map<String, Object>) m;
                }).toList();

        return Map.of(
                "id", o.getId(),
                "portfolioId", o.getPortfolioId(),
                "generatedAt", o.getGeneratedAt(),
                "positions", positions
        );
    }
}
