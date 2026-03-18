package com.darkfactor.platform.initiative.domain.port;

import com.darkfactor.platform.initiative.domain.InitiativeAggregate;
import java.util.Optional;
import java.util.UUID;

public interface InitiativeRepository {
  InitiativeAggregate save(InitiativeAggregate aggregate);

  Optional<InitiativeAggregate> findById(UUID id);
}
