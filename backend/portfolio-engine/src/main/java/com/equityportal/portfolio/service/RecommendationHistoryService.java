package com.equityportal.portfolio.service;

import com.equityportal.persistence.entity.PortfolioRecommendation;
import com.equityportal.persistence.repository.PortfolioRecommendationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecommendationHistoryService {

    private final PortfolioRecommendationRepository portfolioRecommendationRepository;

    public RecommendationHistoryService(PortfolioRecommendationRepository portfolioRecommendationRepository) {
        this.portfolioRecommendationRepository = portfolioRecommendationRepository;
    }

    @Transactional(readOnly = true)
    public List<PortfolioRecommendation> getHistory(UUID userId) {
        return portfolioRecommendationRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<PortfolioRecommendation> getById(UUID id) {
        return portfolioRecommendationRepository.findById(id);
    }
}
