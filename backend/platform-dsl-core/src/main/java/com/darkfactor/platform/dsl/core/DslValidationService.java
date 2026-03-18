package com.darkfactor.platform.dsl.core;

import java.util.List;

public interface DslValidationService {
  List<PlatformDslDocument.ValidationIssue> validate(PlatformDslDocument document);
}
