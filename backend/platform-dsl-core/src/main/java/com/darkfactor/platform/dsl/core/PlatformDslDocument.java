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
    DomainModel domainModel,
    CapabilityModel capabilityModel,
    ServiceDesign serviceDesign,
    WorkflowModel workflowModel,
    NonFunctionalRequirements nonFunctionalRequirements,
    List<Constraint> constraints,
    List<Assumption> assumptions,
    List<Risk> risks,
    ArchitectureInputs architectureInputs,
    DeployableSolutionInputs deployableSolutionInputs,
    Traceability traceability,
    Validation validation
) {
  public record Metadata(String schemaId, String schemaVersion, String documentKind, String source) {}

  public record Versioning(long documentVersion, Instant createdAt, Instant updatedAt, String migrationState, String changeSummary) {}

  public record Provenance(String source, String author, Instant createdAt, Instant updatedAt) {}

  public record SemanticElement(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags
  ) {}

  public record Project(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String slug) {}

  public record Initiative(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String key,
      String summary,
      String vision,
      List<String> targetOutcomes
  ) {}

  public record BusinessContext(String industry, String businessDomain, String problemStatement, String businessValue, List<String> stakeholders) {}

  public record Constraint(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String category) {}

  public record Assumption(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String confidence) {}

  public record Risk(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String impact, String mitigation) {}

  public record Epic(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String initiativeId,
      String key,
      String businessOutcome,
      String priority
  ) {}

  public record UserStory(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String initiativeId,
      String epicId,
      String key,
      String narrative,
      String businessValue,
      List<String> actorIds
  ) {}

  public record AcceptanceCriterion(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String userStoryId,
      String fitCriterion
  ) {}

  public record BusinessRule(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String ruleExpression,
      String ruleKind
  ) {}

  public record Backlog(
      List<Epic> epics,
      List<UserStory> userStories,
      List<AcceptanceCriterion> acceptanceCriteria,
      List<BusinessRule> businessRules
  ) {}

  public record Actor(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String actorKind, List<String> responsibilities) {}

  public record DomainEntity(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String entityKind, List<DomainAttribute> attributes) {}

  public record AggregateGroup(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, List<String> entityIds) {}

  public record DomainAttribute(String name, String type, boolean required) {}

  public record DomainModel(List<Actor> actors, List<DomainEntity> domainEntities, List<AggregateGroup> aggregateGroups) {}

  public record Capability(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String capabilityKind, String businessOutcome) {}

  public record CapabilityModel(List<Capability> capabilities) {}

  public record ServiceCandidate(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String boundedDomainName,
      String responsibilityStatement,
      List<String> ownedEntityIds,
      List<String> supportedCapabilityIds,
      List<String> inboundInterfaceIds,
      List<String> outboundEventIds,
      List<String> dependencyIds,
      String securitySensitivity,
      String dataClassification
  ) {}

  public record ServiceResponsibility(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String serviceCandidateId, String responsibilityStatement) {}

  public record ServiceInterface(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String serviceCandidateId, String interfaceKind, String contract) {}

  public record ServiceEvent(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String serviceCandidateId, String eventType, String payloadHint) {}

  public record ServiceDesign(
      List<ServiceCandidate> serviceCandidates,
      List<ServiceResponsibility> responsibilities,
      List<ServiceInterface> interfaces,
      List<ServiceEvent> events
  ) {}

  public record WorkflowNodeSemantic(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String nodeType,
      String storyId,
      String actorId,
      String capabilityId,
      List<String> entityIds,
      List<String> businessRuleIds
  ) {}

  public record WorkflowNodeVisual(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String semanticNodeId,
      Position position,
      Size size,
      String stylePreset
  ) {}

  public record WorkflowConnectionSemantic(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String sourceNodeId,
      String targetNodeId,
      String connectionType,
      String conditionExpression
  ) {}

  public record WorkflowConnectionVisual(
      String id,
      String type,
      String name,
      String description,
      String status,
      Provenance provenance,
      List<String> tags,
      String semanticConnectionId,
      Position labelPosition
  ) {}

  public record WorkflowModel(
      String id,
      String name,
      String description,
      List<WorkflowNodeSemantic> semanticNodes,
      List<WorkflowNodeVisual> visualNodes,
      List<WorkflowConnectionSemantic> semanticConnections,
      List<WorkflowConnectionVisual> visualConnections
  ) {}

  public record Position(int x, int y) {}

  public record Size(int width, int height) {}

  public record NonFunctionalRequirement(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String category, String measure) {}

  public record NonFunctionalRequirements(List<NonFunctionalRequirement> requirements) {}

  public record ArchitectureConcern(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String concernKind) {}

  public record ArchitectureInputs(List<ArchitectureConcern> concerns, List<String> deploymentConstraints, List<String> dataStores) {}

  public record DeployableSolutionInput(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String targetKind, String targetName, String configurationHint) {}

  public record DeployableSolutionInputs(List<DeployableSolutionInput> targets) {}

  public record TraceLink(String id, String sourceRef, String targetRef, String relationshipType, String rationale, String confidence) {}

  public record Traceability(List<TraceLink> links) {}

  public record ValidationIssue(String id, String category, String severity, String code, String message, String elementId) {}

  public record Validation(
      List<ValidationIssue> structural,
      List<ValidationIssue> semantic,
      List<ValidationIssue> traceability,
      List<ValidationIssue> completeness,
      List<ValidationIssue> evolution
  ) {}
}
