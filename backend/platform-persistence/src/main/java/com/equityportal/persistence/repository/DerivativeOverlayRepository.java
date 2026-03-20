package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.DerivativeOverlay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DerivativeOverlayRepository extends JpaRepository<DerivativeOverlay, UUID> {

    Optional<DerivativeOverlay> findByPortfolioId(UUID portfolioId);
}
