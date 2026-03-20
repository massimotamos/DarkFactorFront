package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.PortfolioRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PortfolioRecommendationRepository extends JpaRepository<PortfolioRecommendation, UUID> {

    List<PortfolioRecommendation> findByUserIdOrderByGeneratedAtDesc(UUID userId);
}
