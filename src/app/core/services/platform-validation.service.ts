import { Injectable } from '@angular/core';
import {
  PlatformDslDocument,
  TraceLinkType,
  ValidationCategory,
  ValidationIssueRecord,
  ValidationReport
} from '../models/platform.models';

@Injectable({ providedIn: 'root' })
export class PlatformValidationService {
  validate(document: PlatformDslDocument): ValidationReport {
    const structural = this.validateStructural(document);
    const semantic = this.validateSemantic(document);
    const traceability = this.validateTraceability(document);
    const requirementCompleteness = this.validateCompleteness(document);

    return {
      issues: [...structural, ...semantic, ...traceability, ...requirementCompleteness],
      byCategory: {
        structural,
        semantic,
        traceability,
        'requirement-completeness': requirementCompleteness
      }
    };
  }

  private validateStructural(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];
    const nodeIds = new Set(document.workflowModel.semanticNodes.map((node) => node.id));
    const connectedNodeIds = new Set<string>();

    for (const connection of document.workflowModel.connections) {
      connectedNodeIds.add(connection.sourceNodeId);
      connectedNodeIds.add(connection.targetNodeId);

      if (!nodeIds.has(connection.sourceNodeId) || !nodeIds.has(connection.targetNodeId)) {
        issues.push(this.issue('structural', 'error', 'WORKFLOW_CONNECTION_TARGET_MISSING', 'Workflow connection references a missing node.', connection.id));
      }
    }

    for (const node of document.workflowModel.semanticNodes) {
      if (document.workflowModel.semanticNodes.length > 1 && !connectedNodeIds.has(node.id)) {
        issues.push(this.issue('structural', 'warning', 'WORKFLOW_NODE_DISCONNECTED', 'Workflow node is disconnected.', node.id));
      }
    }

    if (!document.workflowModel.semanticNodes.some((node) => node.nodeType === 'startEvent')) {
      issues.push(this.issue('structural', 'error', 'WORKFLOW_START_MISSING', 'Workflow model is missing a start event.', null));
    }
    if (!document.workflowModel.semanticNodes.some((node) => node.nodeType === 'endEvent')) {
      issues.push(this.issue('structural', 'error', 'WORKFLOW_END_MISSING', 'Workflow model is missing an end event.', null));
    }

    return issues;
  }

  private validateSemantic(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];

    for (const story of document.backlog.userStories) {
      if (story.acceptanceCriteria.length === 0) {
        issues.push(this.issue('semantic', 'warning', 'USER_STORY_ACCEPTANCE_EMPTY', 'User story has no acceptance criteria.', story.id));
      }
    }

    for (const capability of document.capabilityModel.capabilities) {
      if (!document.traceability.relationships.some((link) =>
        link.type === 'workflow_step_to_capability' && link.targetId === capability.id
      )) {
        issues.push(this.issue('semantic', 'info', 'CAPABILITY_UNMAPPED', 'Capability is not yet mapped from any workflow step.', capability.id));
      }
    }

    return issues;
  }

  private validateTraceability(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];
    const index = this.buildElementIndex(document);

    for (const link of document.traceability.relationships) {
      if (!index.has(link.sourceId) || !index.has(link.targetId)) {
        issues.push(this.issue('traceability', 'error', 'TRACE_ENDPOINT_MISSING', 'Traceability link references a missing source or target.', link.id));
      }
    }

    issues.push(...this.ensureRelationship(document, 'initiative_to_epic', document.initiative.id, document.backlog.epics.map((epic) => epic.id), 'initiative'));
    issues.push(...this.ensureRelationship(document, 'epic_to_user_story', null, document.backlog.userStories.map((story) => story.id), 'epic'));

    return issues;
  }

  private validateCompleteness(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];

    if (document.nonFunctionalRequirements.requirements.length === 0) {
      issues.push(this.issue('requirement-completeness', 'warning', 'NFRS_EMPTY', 'No non-functional requirements have been modeled.', null));
    }

    for (const story of document.backlog.userStories) {
      const hasWorkflowTrace = document.traceability.relationships.some((link) =>
        link.type === 'user_story_to_workflow_step' && link.sourceId === story.id
      );
      if (!hasWorkflowTrace) {
        issues.push(this.issue('requirement-completeness', 'warning', 'USER_STORY_WORKFLOW_TRACE_MISSING', 'User story is not traced to a workflow step.', story.id));
      }
    }

    return issues;
  }

  private ensureRelationship(
    document: PlatformDslDocument,
    type: TraceLinkType,
    fixedSourceId: string | null,
    targetIds: string[],
    sourceTypeLabel: string
  ): ValidationIssueRecord[] {
    return targetIds
      .filter((targetId) => !document.traceability.relationships.some((link) =>
        link.type === type && (fixedSourceId ? link.sourceId === fixedSourceId : true) && link.targetId === targetId
      ))
      .map((targetId) =>
        this.issue('traceability', 'warning', 'TRACE_LINK_EXPECTED', `Expected ${type} traceability from ${sourceTypeLabel}.`, targetId)
      );
  }

  private buildElementIndex(document: PlatformDslDocument): Set<string> {
    return new Set([
      document.project.id,
      document.initiative.id,
      ...document.businessContext.actors.map((item) => item.id),
      ...document.businessContext.constraints.map((item) => item.id),
      ...document.businessContext.assumptions.map((item) => item.id),
      ...document.businessContext.risks.map((item) => item.id),
      ...document.backlog.epics.map((item) => item.id),
      ...document.backlog.userStories.map((item) => item.id),
      ...document.backlog.userStories.flatMap((item) => item.acceptanceCriteria.map((criterion) => criterion.id)),
      ...document.backlog.businessRules.map((item) => item.id),
      ...document.workflowModel.semanticNodes.map((item) => item.id),
      ...document.domainModel.entities.map((item) => item.id),
      ...document.capabilityModel.capabilities.map((item) => item.id),
      ...document.serviceDesign.serviceCandidates.map((item) => item.id),
      ...document.serviceDesign.architectureConcerns.map((item) => item.id),
      ...document.nonFunctionalRequirements.requirements.map((item) => item.id)
    ]);
  }

  private issue(
    category: ValidationCategory,
    severity: ValidationIssueRecord['severity'],
    code: string,
    message: string,
    elementId: string | null
  ): ValidationIssueRecord {
    return {
      id: `${category}-${code}-${elementId ?? 'document'}`,
      category,
      severity,
      code,
      message,
      elementId
    };
  }
}
