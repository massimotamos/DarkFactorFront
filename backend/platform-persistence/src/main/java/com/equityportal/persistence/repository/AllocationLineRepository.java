package com.equityportal.persistence.repository;

import com.equityportal.persistence.entity.AllocationLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AllocationLineRepository extends JpaRepository<AllocationLine, UUID> {
}
