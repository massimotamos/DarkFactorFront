package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.MarketDataSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MarketDataSnapshotRepository extends JpaRepository<MarketDataSnapshot, UUID> {

    Optional<MarketDataSnapshot> findByTicker(String ticker);
}
