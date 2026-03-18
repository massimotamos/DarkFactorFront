package com.darkfactor.platform.initiative.domain.service;

import com.darkfactor.platform.dsl.core.DslDocumentStore;
import com.darkfactor.platform.dsl.core.PlatformDslDocument;
import com.darkfactor.platform.initiative.domain.port.InitiativeRepository;

public class InitiativeApplicationService {
  private final InitiativeRepository initiativeRepository;
  private final DslDocumentStore dslDocumentStore;

  public InitiativeApplicationService(InitiativeRepository initiativeRepository, DslDocumentStore dslDocumentStore) {
    this.initiativeRepository = initiativeRepository;
    this.dslDocumentStore = dslDocumentStore;
  }

  public PlatformDslDocument persistProjectSnapshot(PlatformDslDocument document) {
    return dslDocumentStore.save(document);
  }
}
