import { Injectable } from '@angular/core';
import { ComposerNodeType } from '../models/composer.models';

type LinkKey =
  | 'role->view'
  | 'role->task'
  | 'role->rule'
  | 'view->task'
  | 'view->entity'
  | 'task->entity'
  | 'task->rule'
  | 'task->integration'
  | 'task->view'
  | 'rule->entity'
  | 'rule->task'
  | 'integration->entity';

interface LinkRuleDefinition {
  relation: string;
}

@Injectable({ providedIn: 'root' })
export class SemanticLinkRulesService {
  private readonly rules: Record<LinkKey, LinkRuleDefinition> = {
    'role->view': { relation: 'accesses' },
    'role->task': { relation: 'executes' },
    'role->rule': { relation: 'constrains' },
    'view->task': { relation: 'triggers' },
    'view->entity': { relation: 'displays' },
    'task->entity': { relation: 'updates' },
    'task->rule': { relation: 'guards' },
    'task->integration': { relation: 'calls' },
    'task->view': { relation: 'navigates' },
    'rule->entity': { relation: 'evaluates' },
    'rule->task': { relation: 'guards' },
    'integration->entity': { relation: 'maps-to' }
  };

  isAllowed(sourceType: ComposerNodeType, targetType: ComposerNodeType): boolean {
    return this.lookup(sourceType, targetType) !== null;
  }

  defaultRelation(sourceType: ComposerNodeType, targetType: ComposerNodeType): string | null {
    return this.lookup(sourceType, targetType)?.relation ?? null;
  }

  allowedTargetsFor(sourceType: ComposerNodeType): ComposerNodeType[] {
    return Object.keys(this.rules)
      .filter((key) => key.startsWith(`${sourceType}->`))
      .map((key) => key.split('->')[1] as ComposerNodeType);
  }

  private lookup(sourceType: ComposerNodeType, targetType: ComposerNodeType): LinkRuleDefinition | null {
    return this.rules[`${sourceType}->${targetType}` as LinkKey] ?? null;
  }
}
