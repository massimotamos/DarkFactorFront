package com.darkfactor.platform.dsl.core;

public interface DocumentUpgradeStrategy {
  boolean supports(String schemaVersion);

  PlatformDslDocument upgrade(PlatformDslDocument document);
}
