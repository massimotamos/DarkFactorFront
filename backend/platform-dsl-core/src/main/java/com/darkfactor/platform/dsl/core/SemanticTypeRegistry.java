package com.darkfactor.platform.dsl.core;

import java.util.EnumSet;
import java.util.Set;

public final class SemanticTypeRegistry {
  private SemanticTypeRegistry() {
  }

  public static Set<SemanticElementType> allTypes() {
    return EnumSet.allOf(SemanticElementType.class);
  }
}
