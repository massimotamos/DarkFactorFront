package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.DerivativePosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DerivativePositionRepository extends JpaRepository<DerivativePosition, UUID> {
}
