import { Injectable } from '@angular/core';
import { AstValidationIssue, FullStackApplicationAst, ProjectValidationResult } from '../models/semantic-ast.models';

@Injectable({ providedIn: 'root' })
export class ProjectValidationService {
  validate(ast: FullStackApplicationAst, baseIssues: AstValidationIssue[]): ProjectValidationResult {
    const syntaxIssues = baseIssues.filter((issue) =>
      issue.code.includes('MISSING') || issue.code.includes('DUPLICATE')
    );
    const semanticIssues = baseIssues.filter((issue) =>
      issue.code.startsWith('LINK_')
    );
    const generationIssues = this.computeGenerationIssues(ast);
    const allIssues = [...syntaxIssues, ...semanticIssues, ...generationIssues];

    return {
      status: allIssues.some((issue) => issue.severity === 'error')
        ? 'invalid'
        : allIssues.some((issue) => issue.severity === 'warning')
          ? 'warning'
          : 'valid',
      syntaxIssues,
      semanticIssues,
      generationIssues
    };
  }

  private computeGenerationIssues(ast: FullStackApplicationAst): AstValidationIssue[] {
    const issues: AstValidationIssue[] = [];
    if (ast.applicationContexts.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'APPLICATION_CONTEXT_MISSING',
        message: 'The project has no Application Context node, so first-draft generation and high-level intent capture are unavailable.'
      });
    }
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    for (const link of ast.links) {
      incoming.set(link.to, [...(incoming.get(link.to) ?? []), link.from]);
      outgoing.set(link.from, [...(outgoing.get(link.from) ?? []), link.to]);
    }

    for (const view of ast.views) {
      const targets = outgoing.get(view.id) ?? [];
      const reachesTask = targets.some((targetId) => ast.tasks.some((task) => task.id === targetId));
      if (!reachesTask) {
        issues.push({
          severity: 'warning',
          code: 'VIEW_WITHOUT_TASK',
          message: `View "${view.label}" does not trigger any task, so it cannot yet generate full application behavior.`,
          elementId: view.id
        });
      }
    }

    for (const task of ast.tasks) {
      const targets = outgoing.get(task.id) ?? [];
      const touchesEntity = targets.some((targetId) => ast.entities.some((entity) => entity.id === targetId));
      const touchesIntegration = targets.some((targetId) => ast.integrations.some((integration) => integration.id === targetId));
      const touchesView = targets.some((targetId) => ast.views.some((view) => view.id === targetId));

      if (!touchesEntity && !touchesIntegration && !touchesView) {
        issues.push({
          severity: 'error',
          code: 'TASK_NOT_GENERATABLE',
          message: `Task "${task.label}" is isolated from entities, views, and integrations, so it is not code-generatable.`,
          elementId: task.id
        });
      }
    }

    for (const role of ast.roles) {
      const targets = outgoing.get(role.id) ?? [];
      if (targets.length === 0) {
        issues.push({
          severity: 'warning',
          code: 'ROLE_NOT_ASSIGNED',
          message: `Role "${role.label}" is not linked to any view, task, or rule.`,
          elementId: role.id
        });
      }
    }

    for (const integration of ast.integrations) {
      const sources = incoming.get(integration.id) ?? [];
      const calledByTask = sources.some((sourceId) => ast.tasks.some((task) => task.id === sourceId));
      if (!calledByTask) {
        issues.push({
          severity: 'warning',
          code: 'INTEGRATION_NOT_USED',
          message: `Integration "${integration.label}" is not called by any task.`,
          elementId: integration.id
        });
      }
    }

    return issues;
  }
}
