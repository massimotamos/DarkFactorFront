package com.darkfactor.platform.rest.api.dto;

import com.darkfactor.platform.dsl.core.PlatformDslDocument;
import java.util.List;

public record ValidationViewResponse(List<PlatformDslDocument.ValidationIssue> issues) {}
