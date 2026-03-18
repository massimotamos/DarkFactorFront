package com.darkfactor.platform.dsl.core;

import java.util.Optional;

public interface DslDocumentStore {
  PlatformDslDocument save(PlatformDslDocument document);

  Optional<PlatformDslDocument> findByProjectId(String projectId);
}
