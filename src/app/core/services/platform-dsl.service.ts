import { Injectable } from '@angular/core';
import { PlatformDslDocument } from '../models/platform.models';

@Injectable({ providedIn: 'root' })
export class PlatformDslService {
  serialize(document: PlatformDslDocument): string {
    return JSON.stringify(document, null, 2);
  }

  parse(raw: string): PlatformDslDocument {
    const parsed = JSON.parse(raw) as PlatformDslDocument;

    if (parsed.metadata.schemaId !== 'darkfactor.platform.dsl' || parsed.metadata.schemaVersion !== '2.0.0') {
      throw new Error('Unsupported DSL document version.');
    }

    return parsed;
  }
}
