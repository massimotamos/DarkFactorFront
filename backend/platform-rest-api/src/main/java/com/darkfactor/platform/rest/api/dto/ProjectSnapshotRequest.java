package com.darkfactor.platform.rest.api.dto;

import com.darkfactor.platform.dsl.core.PlatformDslDocument;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record ProjectSnapshotRequest(@NotNull @Valid PlatformDslDocument document) {}
