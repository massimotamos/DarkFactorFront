package com.darkfactor.platform.graph.domain;

public record WorkflowConnectionRecord(
    String id,
    String sourceNodeId,
    String targetNodeId,
    String label,
    String connectionType
) {}
