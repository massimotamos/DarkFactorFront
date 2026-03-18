package com.darkfactor.platform.persistence.adapter;

import com.darkfactor.platform.dsl.core.DslDocumentStore;
import com.darkfactor.platform.dsl.core.PlatformDslDocument;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class FileSystemDslDocumentStore implements DslDocumentStore {
  @Override
  public PlatformDslDocument save(PlatformDslDocument document) {
    return document;
  }

  @Override
  public Optional<PlatformDslDocument> findByProjectId(String projectId) {
    return Optional.empty();
  }
}
