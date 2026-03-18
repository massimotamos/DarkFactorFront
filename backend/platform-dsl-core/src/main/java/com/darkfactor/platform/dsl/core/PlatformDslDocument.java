package com.darkfactor.platform.dsl.core;

import java.time.Instant;
import java.util.List;

public record PlatformDslDocument(
    Metadata metadata,
    Versioning versioning,
    Project project,
    Initiative initiative,
    BusinessContext businessContext,
    Backlog backlog,
    WorkflowModel workflowModel,
    DomainModel domainModel,
    CapabilityModel capabilityModel,
    ServiceDesign serviceDesign,
    NonFunctionalRequirements nonFunctionalRequirements,
    Traceability traceability,
    Validation validation
) {
  public record Metadata(
      String schemaId,
      String schemaVersion,
      String documentKind,
      String source,
      Instant exportedAt
  ) {}

  public record Versioning(
      long documentVersion,
      String baselineVersion,
      MigrationReadiness migrationReadiness,
      ChangeInfo changeInfo
  ) {}

  public record ChangeInfo(String summary, String changedBy, Instant changedAt) {}

  public record ElementProvenance(String source, String author, Instant createdAt, Instant updatedAt) {}

  public record CanonicalElement(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance
  ) {}

  public record Project(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String slug
  ) {}

  public record Initiative(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String key,
      String summary,
      String vision
  ) {}

  public record Actor(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String actorKind,
      List<String> responsibilities
  ) {}

  public record Constraint(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String category
  ) {}

  public record Assumption(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String confidence
  ) {}

  public record Risk(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String impact,
      String mitigation
  ) {}

  public record BusinessContext(
      String domain,
      String problemStatement,
      String targetOutcome,
      List<Actor> actors,
      List<Constraint> constraints,
      List<Assumption> assumptions,
      List<Risk> risks
  ) {}

  public record Epic(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String initiativeId,
      String key,
      String outcome,
      String priority
  ) {}

  public record AcceptanceCriterion(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String userStoryId,
      String fitCriterion
  ) {}

  public record BusinessRule(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String ruleExpression,
      String ruleKind
  ) {}

  public record UserStory(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String initiativeId,
      String epicId,
      String key,
      String narrative,
      List<AcceptanceCriterion> acceptanceCriteria,
      List<String> businessRuleIds,
      List<String> domainEntityIds
  ) {}

  public record Backlog(List<Epic> epics, List<UserStory> userStories, List<BusinessRule> businessRules) {}

  public record DomainEntity(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String entityKind,
      List<DomainAttribute> attributes
  ) {}

  public record DomainAttribute(String name, String type, boolean required) {}

  public record DomainModel(List<DomainEntity> entities) {}

  public record Capability(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String capabilityKind,
      String outcome
  ) {}

  public record CapabilityModel(List<Capability> capabilities) {}

  public record ServiceCandidate(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      List<String> capabilityIds,
      String serviceStyle
  ) {}

  public record ArchitectureConcern(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String concernKind
  ) {}

  public record ServiceDesign(List<ServiceCandidate> serviceCandidates, List<ArchitectureConcern> architectureConcerns) {}

  public record NonFunctionalRequirement(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      String qualityAttribute,
      String measure
  ) {}

  public record NonFunctionalRequirements(List<NonFunctionalRequirement> requirements) {}

  public record WorkflowNode(
      String id,
      SemanticElementType type,
      String name,
      String description,
      SemanticStatus status,
      ElementProvenance provenance,
      WorkflowNodeType nodeType,
      String actorId,
      String storyId,
      List<String> businessRuleIds,
      String capabilityId,
      String serviceCandidateId
  ) {}

  public record VisualNode(String nodeId, Position position, Size size) {}

  public record Position(int x, int y) {}

  public record Size(int width, int height) {}

  public record WorkflowConnection(
      String id,
      String type,
      String sourceNodeId,
      String targetNodeId,
      String label
  ) {}

  public record WorkflowModel(
      String id,
      String name,
      String description,
      List<WorkflowNode> semanticNodes,
      List<VisualNode> visualNodes,
      List<WorkflowConnection> connections
  ) {}

  public record TraceabilityLink(
      String id,
      TraceLinkType type,
      String sourceId,
      String targetId,
      String rationale,
      ElementProvenance provenance
  ) {}

  public record Traceability(List<TraceabilityLink> relationships) {}

  public record ValidationIssue(
      String id,
      ValidationCategory category,
      ValidationSeverity severity,
      String code,
      String message,
      String elementId
  ) {}

  public record Validation(
      List<ValidationIssue> structural,
      List<ValidationIssue> semantic,
      List<ValidationIssue> traceability,
      List<ValidationIssue> requirementCompleteness
  ) {}
}
