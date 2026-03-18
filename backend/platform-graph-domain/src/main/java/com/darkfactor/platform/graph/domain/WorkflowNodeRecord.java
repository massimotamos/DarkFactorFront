package com.darkfactor.platform.graph.domain;

import java.util.List;

public record WorkflowNodeRecord(
    String id,
    String type,
    String name,
    String label,
    String description,
    String epicId,
    String storyId,
    NodeMetadata metadata,
    NodeLayout layout
) {
  public record NodeMetadata(String actor, String system, String policy, List<String> tags) {}

  public record NodeLayout(int x, int y, int width, int height) {}
}
