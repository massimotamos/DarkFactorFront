package com.darkfactor.platform.graph.domain.service;

import com.darkfactor.platform.graph.domain.WorkflowGraphAggregate;

public class WorkflowGraphValidationService {
  public boolean hasRequiredTerminalNodes(WorkflowGraphAggregate aggregate) {
    boolean hasStart = aggregate.nodes().stream().anyMatch(node -> "start".equals(node.type()));
    boolean hasEnd = aggregate.nodes().stream().anyMatch(node -> "end".equals(node.type()));
    return hasStart && hasEnd;
  }
}
