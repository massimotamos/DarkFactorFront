package com.darkfactor.platform.epic.domain;

public record EpicRecord(
    String id,
    String initiativeId,
    String key,
    String name,
    String goal,
    String outcome,
    String priority
) {}
