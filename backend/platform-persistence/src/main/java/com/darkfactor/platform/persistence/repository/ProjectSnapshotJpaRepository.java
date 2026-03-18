package com.darkfactor.platform.persistence.repository;

import com.darkfactor.platform.persistence.entity.ProjectSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectSnapshotJpaRepository extends JpaRepository<ProjectSnapshotEntity, String> {
}
