package com.darkfactor.platform.initiative.domain;

import java.time.Instant;
import java.util.UUID;

public record InitiativeAggregate(
    UUID id,
    String initiativeKey,
    String name,
    String summary,
    String status,
    String projectSlug,
    Instant createdAt,
    Instant updatedAt
) {}
