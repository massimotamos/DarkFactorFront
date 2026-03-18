package com.darkfactor.platform.graph.domain;

import java.util.List;

public record WorkflowGraphAggregate(
    String id,
    String initiativeId,
    String name,
    List<WorkflowNodeRecord> nodes,
    List<WorkflowConnectionRecord> connections
) {}
