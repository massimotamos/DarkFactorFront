package com.darkfactor.platform.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_snapshot")
public class ProjectSnapshotEntity {
  @Id
  @Column(name = "project_id", nullable = false)
  private String projectId;

  @Column(name = "version_number", nullable = false)
  private long version;

  @Column(name = "initiative_key", nullable = false)
  private String initiativeKey;

  @Column(name = "dsl_file_path", nullable = false)
  private String dslFilePath;

  protected ProjectSnapshotEntity() {
  }

  public ProjectSnapshotEntity(String projectId, long version, String initiativeKey, String dslFilePath) {
    this.projectId = projectId;
    this.version = version;
    this.initiativeKey = initiativeKey;
    this.dslFilePath = dslFilePath;
  }

  public String getProjectId() {
    return projectId;
  }

  public long getVersion() {
    return version;
  }

  public String getInitiativeKey() {
    return initiativeKey;
  }

  public String getDslFilePath() {
    return dslFilePath;
  }
}
