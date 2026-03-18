package com.darkfactor.platform.rest.api.dto;

public record ProjectSnapshotResponse(
    String projectId,
    long version,
    String dslFilePath,
    String persistenceStatus
) {}
