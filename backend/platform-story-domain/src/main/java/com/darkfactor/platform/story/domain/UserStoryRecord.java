package com.darkfactor.platform.story.domain;

import java.util.List;

public record UserStoryRecord(
    String id,
    String initiativeId,
    String epicId,
    String key,
    String title,
    String narrative,
    List<String> acceptanceCriteria,
    String status
) {}
