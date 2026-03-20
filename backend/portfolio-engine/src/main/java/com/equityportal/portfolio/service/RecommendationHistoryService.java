package com.equityportal.portfolio.service;

import com.equityportal.persistence.entity.PortfolioRecommendation;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecommendationHistoryService {

    private final PortfolioRecommendationRepository portfolioRecommendationRepository;

    public RecommendationHistoryService(PortfolioRecommendationRepository portfolioRecommendationRepository) {
        this.portfolioRecommendationRepository = portfolioRecommendationRepository;
    }

    public List<PortfolioRecommendation> getHistory(UUID userId) {
        return portfolioRecommendationRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    public Optional<PortfolioRecommendation> getById(UUID id) {
        return portfolioRecommendationRepository.findById(id);
    }
}
