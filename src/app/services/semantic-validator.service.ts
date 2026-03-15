import { Injectable } from '@angular/core';
import { FullStackApplicationAst, AstValidationIssue } from '../models/semantic-ast.models';

@Injectable({ providedIn: 'root' })
export class SemanticValidatorService {
  validate(ast: FullStackApplicationAst): AstValidationIssue[] {
    const issues: AstValidationIssue[] = [];

    this.ensureUniqueNames(ast.entities, 'ENTITY_DUPLICATE_NAME', 'Entity', issues);
    this.ensureUniqueNames(ast.pages, 'PAGE_DUPLICATE_NAME', 'Page', issues);
    this.ensureUniqueNames(ast.services, 'SERVICE_DUPLICATE_NAME', 'Service', issues);
    this.ensureUniqueNames(ast.endpoints, 'ENDPOINT_DUPLICATE_NAME', 'Endpoint', issues);
    this.ensureUniqueNames(ast.actions, 'ACTION_DUPLICATE_NAME', 'Action', issues);
    this.ensureUniqueNames(ast.conditions, 'CONDITION_DUPLICATE_NAME', 'Condition', issues);

    for (const node of [...ast.entities, ...ast.pages, ...ast.services, ...ast.endpoints, ...ast.actions, ...ast.conditions]) {
      if (!node.prompt.trim()) {
        issues.push({
          severity: 'warning',
          code: 'PROMPT_MISSING',
          message: `${node.type} "${node.label}" has no prompt defined.`,
          elementId: node.id
        });
      }

      if (!node.semanticCode.trim()) {
        issues.push({
          severity: 'warning',
          code: 'SEMANTIC_CODE_MISSING',
          message: `${node.type} "${node.label}" has not been validated into semantic code yet.`,
          elementId: node.id
        });
      }
    }

    return issues;
  }

  private ensureUniqueNames(
    nodes: Array<{ id: string; name: string }>,
    code: string,
    label: string,
    issues: AstValidationIssue[]
  ): void {
    const seen = new Set<string>();
    for (const node of nodes) {
      if (seen.has(node.name)) {
        issues.push({
          severity: 'error',
          code,
          message: `${label} name "${node.name}" is declared more than once.`,
          elementId: node.id
        });
      }
      seen.add(node.name);
    }
  }
}
