import { Injectable } from '@angular/core';
import { FullStackApplicationAst, AstValidationIssue } from '../models/semantic-ast.models';

@Injectable({ providedIn: 'root' })
export class SemanticValidatorService {
  validate(ast: FullStackApplicationAst): AstValidationIssue[] {
    const issues: AstValidationIssue[] = [];

    this.ensureUniqueKeys(ast.roles, 'ROLE_DUPLICATE_KEY', 'Role', issues);
    this.ensureUniqueNames(ast.entities, 'ENTITY_DUPLICATE_NAME', 'Entity', issues);
    this.ensureUniqueKeys(ast.entities, 'ENTITY_DUPLICATE_KEY', 'Entity', issues);
    this.ensureUniqueKeys(ast.views, 'VIEW_DUPLICATE_KEY', 'View', issues);
    this.ensureUniqueKeys(ast.tasks, 'TASK_DUPLICATE_KEY', 'Task', issues);
    this.ensureUniqueKeys(ast.rules, 'RULE_DUPLICATE_KEY', 'Rule', issues);
    this.ensureUniqueKeys(ast.integrations, 'INTEGRATION_DUPLICATE_KEY', 'Integration', issues);

    for (const node of [
      ...ast.roles,
      ...ast.entities,
      ...ast.views,
      ...ast.tasks,
      ...ast.rules,
      ...ast.integrations
    ]) {
      if (!node.key.trim()) {
        issues.push({
          severity: 'error',
          code: 'SEMANTIC_KEY_MISSING',
          message: `${node.type} "${node.label}" is missing its required semantic key.`,
          elementId: node.id
        });
      }

      if (this.requiresKind(node.type) && !node.kind?.trim()) {
        issues.push({
          severity: 'error',
          code: 'SEMANTIC_KIND_MISSING',
          message: `${node.type} "${node.label}" is missing its required semantic kind.`,
          elementId: node.id
        });
      }

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

  private ensureUniqueKeys(
    nodes: Array<{ id: string; key: string }>,
    code: string,
    label: string,
    issues: AstValidationIssue[]
  ): void {
    const seen = new Set<string>();
    for (const node of nodes) {
      if (seen.has(node.key)) {
        issues.push({
          severity: 'error',
          code,
          message: `${label} key "${node.key}" is declared more than once.`,
          elementId: node.id
        });
      }
      seen.add(node.key);
    }
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

  private requiresKind(type: string): boolean {
    return type === 'task' || type === 'rule' || type === 'integration';
  }
}
