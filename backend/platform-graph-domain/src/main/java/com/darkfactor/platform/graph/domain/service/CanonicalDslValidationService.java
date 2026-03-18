package com.darkfactor.platform.graph.domain.service;

import com.darkfactor.platform.dsl.core.DslValidationService;
import com.darkfactor.platform.dsl.core.PlatformDslDocument;
import java.util.List;

public class CanonicalDslValidationService implements DslValidationService {
  @Override
  public List<PlatformDslDocument.ValidationIssue> validate(PlatformDslDocument document) {
    return List.of();
  }
}
