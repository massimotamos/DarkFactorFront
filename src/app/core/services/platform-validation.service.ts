import { Injectable } from '@angular/core';
import {
  PlatformDslDocument,
  TraceRelationshipType,
  ValidationCategory,
  ValidationIssueRecord,
  ValidationReport,
  ValidationSeverity
} from '../models/platform.models';

@Injectable({ providedIn: 'root' })
export class PlatformValidationService {
  validate(document: PlatformDslDocument): ValidationReport {
    const structural = this.validateStructural(document);
    const semantic = this.validateSemantic(document);
    const traceability = this.validateTraceability(document);
    const completeness = this.validateCompleteness(document);
    const evolution = this.validateEvolution(document);

    return {
      issues: [...structural, ...semantic, ...traceability, ...completeness, ...evolution],
      byCategory: {
        structural,
        semantic,
        traceability,
        completeness,
        evolution
      }
    };
  }

  private validateStructural(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];
    const nodeIds = new Set(document.workflowModel.semanticNodes.map((node) => node.id));

    for (const visualNode of document.workflowModel.visualNodes) {
      if (!nodeIds.has(visualNode.semanticNodeId)) {
        issues.push(this.issue('structural', 'error', 'WORKFLOW_VISUAL_NODE_ORPHAN', 'Visual workflow node has no semantic counterpart.', visualNode.id));
      }
    }

    for (const connection of document.workflowModel.semanticConnections) {
      if (!nodeIds.has(connection.sourceNodeId) || !nodeIds.has(connection.targetNodeId)) {
        issues.push(this.issue('structural', 'error', 'WORKFLOW_CONNECTION_ORPHAN', 'Semantic workflow connection references a missing semantic node.', connection.id));
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
      if (story.actorIds.length === 0) {
        issues.push(this.issue('semantic', 'warning', 'USER_STORY_ACTOR_MISSING', 'User story is missing an actor reference.', story.id));
      }
      if (!story.businessValue.trim()) {
        issues.push(this.issue('semantic', 'warning', 'USER_STORY_VALUE_MISSING', 'User story is missing explicit business value.', story.id));
      }
    }

    for (const service of document.serviceDesign.serviceCandidates) {
      if (service.supportedCapabilityIds.length === 0) {
        issues.push(this.issue('semantic', 'warning', 'SERVICE_CAPABILITY_MISSING', 'Service candidate has no supported capabilities.', service.id));
      }
    }

    for (const entity of document.domainModel.domainEntities) {
      const linked = document.traceability.links.some((link) =>
        link.targetRef === entity.id || link.sourceRef === entity.id
      );
      if (!linked) {
        issues.push(this.issue('semantic', 'info', 'DOMAIN_ENTITY_ORPHAN', 'Domain entity is not traced from stories or services.', entity.id));
      }
    }

    return issues;
  }

  private validateTraceability(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];
    const index = this.index(document);

    for (const link of document.traceability.links) {
      if (!index.has(link.sourceRef) || !index.has(link.targetRef)) {
        issues.push(this.issue('traceability', 'error', 'TRACE_ENDPOINT_MISSING', 'Trace link points to a missing source or target.', link.id));
      }
    }

    issues.push(...this.expectTargets(document, 'initiative_to_epic', document.initiative.id, document.backlog.epics.map((epic) => epic.id)));
    issues.push(...this.expectTargets(document, 'epic_to_userStory', null, document.backlog.userStories.map((story) => story.id)));
    issues.push(...this.expectTargets(document, 'userStory_to_acceptanceCriterion', null, document.backlog.acceptanceCriteria.map((criterion) => criterion.id)));

    return issues;
  }

  private validateCompleteness(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];

    for (const story of document.backlog.userStories) {
      const criteriaCount = document.backlog.acceptanceCriteria.filter((criterion) => criterion.userStoryId === story.id).length;
      if (criteriaCount === 0) {
        issues.push(this.issue('completeness', 'warning', 'USER_STORY_ACCEPTANCE_MISSING', 'User story has no acceptance criteria.', story.id));
      }
    }

    for (const semanticNode of document.workflowModel.semanticNodes) {
      if (!semanticNode.storyId) {
        issues.push(this.issue('completeness', 'warning', 'WORKFLOW_STEP_STORY_MISSING', 'Workflow step is not linked to any story.', semanticNode.id));
      }
    }

    for (const nfr of document.nonFunctionalRequirements.requirements) {
      const linked = document.traceability.links.some((link) =>
        (link.relationshipType === 'nfr_to_architectureConcern' || link.relationshipType === 'nfr_to_serviceCandidate') &&
        link.sourceRef === nfr.id
      );
      if (!linked) {
        issues.push(this.issue('completeness', 'warning', 'NFR_TRACE_MISSING', 'NFR is not linked to a service candidate or architecture concern.', nfr.id));
      }
    }

    return issues;
  }

  private validateEvolution(document: PlatformDslDocument): ValidationIssueRecord[] {
    const issues: ValidationIssueRecord[] = [];
    if (document.versioning.migrationState !== 'native') {
      issues.push(this.issue('evolution', 'warning', 'MIGRATION_PENDING', 'Document still requires migration or normalization.', null));
    }
    if (document.metadata.schemaVersion !== '3.0.0') {
      issues.push(this.issue('evolution', 'error', 'SCHEMA_VERSION_UNSUPPORTED', 'Schema version is not supported by the current frontend.', null));
    }
    return issues;
  }

  private expectTargets(
    document: PlatformDslDocument,
    relationshipType: TraceRelationshipType,
    fixedSource: string | null,
    targetIds: string[]
  ): ValidationIssueRecord[] {
    return targetIds
      .filter((targetId) => !document.traceability.links.some((link) =>
        link.relationshipType === relationshipType &&
        link.targetRef === targetId &&
        (fixedSource ? link.sourceRef === fixedSource : true)
      ))
      .map((targetId) =>
        this.issue('traceability', 'warning', 'EXPECTED_TRACE_MISSING', `Expected ${relationshipType} link is missing.`, targetId)
      );
  }

  private index(document: PlatformDslDocument): Set<string> {
    return new Set([
      document.project.id,
      document.initiative.id,
      ...document.backlog.epics.map((item) => item.id),
      ...document.backlog.userStories.map((item) => item.id),
      ...document.backlog.acceptanceCriteria.map((item) => item.id),
      ...document.backlog.businessRules.map((item) => item.id),
      ...document.domainModel.actors.map((item) => item.id),
      ...document.domainModel.domainEntities.map((item) => item.id),
      ...document.domainModel.aggregateGroups.map((item) => item.id),
      ...document.capabilityModel.capabilities.map((item) => item.id),
      ...document.serviceDesign.serviceCandidates.map((item) => item.id),
      ...document.serviceDesign.responsibilities.map((item) => item.id),
      ...document.serviceDesign.interfaces.map((item) => item.id),
      ...document.serviceDesign.events.map((item) => item.id),
      ...document.workflowModel.semanticNodes.map((item) => item.id),
      ...document.workflowModel.visualNodes.map((item) => item.id),
      ...document.workflowModel.semanticConnections.map((item) => item.id),
      ...document.workflowModel.visualConnections.map((item) => item.id),
      ...document.nonFunctionalRequirements.requirements.map((item) => item.id),
      ...document.constraints.map((item) => item.id),
      ...document.assumptions.map((item) => item.id),
      ...document.risks.map((item) => item.id),
      ...document.architectureInputs.concerns.map((item) => item.id),
      ...document.deployableSolutionInputs.targets.map((item) => item.id)
    ]);
  }

  private issue(
    category: ValidationCategory,
    severity: ValidationSeverity,
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
