package com.darkfactor.platform.dsl.core;

import java.time.Instant;
import java.util.List;

public record PlatformDslDocument(
    Metadata metadata,
    List<SemanticLayerDefinition> semanticLayers,
    DerivationModel derivationModel,
    Versioning versioning,
    Project project,
    IntentLayer intentLayer,
    RequirementLayer requirementLayer,
    DomainLayer domainLayer,
    CapabilityLayer capabilityLayer,
    ArchitectureLayer architectureLayer,
    ExecutionLayer executionLayer,
    DeploymentIntentLayer deploymentIntentLayer,
    VisualizationLayer visualizationLayer,
    Traceability traceability,
    Validation validation
) {
  public record Metadata(String schemaId, String schemaVersion, String documentKind, String source) {}

  public record Versioning(long documentVersion, Instant createdAt, Instant updatedAt, String migrationState, String targetSchemaVersion, String changeSummary) {}

  public record Provenance(String source, String author, Instant createdAt, Instant updatedAt) {}

  public record CanonicalElement(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus) {}

  public record SemanticLayerDefinition(String id, String name, String purpose, List<String> upstreamDependencies, List<String> downstreamDerivationTargets) {}

  public record DerivationRule(String id, String name, String sourceLayer, String targetLayer, List<String> sourceTypes, List<String> targetTypes, String derivationMethod, boolean analystApprovalRequired, String description) {}

  public record DerivationRecord(String id, String ruleId, List<String> sourceRefs, List<String> targetRefs, String derivationStage, String derivationStatus, String derivationMethod, boolean analystApprovalRequired, String analystApprovalStatus, String confidence, String rationale, String validationStatus, String supersedes, String supersededBy) {}

  public record DerivationModel(List<DerivationRule> derivationRules, List<DerivationRecord> derivationRecords) {}

  public record Project(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String slug) {}

  public record Goal(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String metric) {}

  public record Initiative(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String key, String summary, String vision, List<String> targetOutcomes, List<String> goalIds) {}

  public record BusinessContext(String id, String industry, String businessDomain, String problemStatement, String businessValue, List<String> stakeholders, String operatingModel, List<String> regulatoryContext, List<String> expectedOutcomes) {}

  public record IntentLayer(Initiative initiative, List<Goal> goals, BusinessContext businessContext) {}

  public record Epic(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String initiativeId, String key, String businessOutcome, String priority) {}

  public record UserStory(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String initiativeId, String epicId, String key, String narrative, String businessValue, List<String> actorIds, List<String> acceptanceCriterionIds, List<String> businessRuleIds, List<String> domainEntityIds, List<String> capabilityIds, List<String> nfrIds, List<String> workflowNodeIds) {}

  public record AcceptanceCriterion(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String userStoryId, String fitCriterion) {}

  public record BusinessRule(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String ruleExpression, String ruleKind) {}

  public record Nfr(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String category, String measure) {}

  public record Constraint(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String category) {}

  public record Assumption(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String confidence) {}

  public record Risk(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String impact, String mitigation) {}

  public record Backlog(List<Epic> epics, List<UserStory> userStories, List<AcceptanceCriterion> acceptanceCriteria, List<BusinessRule> businessRules) {}

  public record RequirementLayer(Backlog backlog, NonFunctionalRequirements nonFunctionalRequirements, List<Constraint> constraints, List<Assumption> assumptions, List<Risk> risks) {}

  public record Actor(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String actorKind, List<String> responsibilities) {}

  public record DomainAttribute(String name, String type, boolean required) {}

  public record DomainEntity(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String entityKind, List<DomainAttribute> attributes) {}

  public record AggregateGroup(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, List<String> entityIds) {}

  public record DomainRelationship(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String sourceEntityId, String targetEntityId, String relationshipKind) {}

  public record DomainLayer(List<Actor> actors, List<DomainEntity> domainEntities, List<AggregateGroup> aggregateGroups, List<DomainRelationship> domainRelationships) {}

  public record Capability(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String capabilityKind, String businessOutcome) {}

  public record CapabilityGroup(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, List<String> capabilityIds) {}

  public record CapabilityLayer(List<Capability> capabilities, List<CapabilityGroup> capabilityGroups) {}

  public record ServiceCandidate(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String boundedDomainName, String responsibilityStatement, List<String> ownedEntityIds, List<String> supportedCapabilityIds, List<String> inboundInterfaceIds, List<String> outboundEventIds, List<String> dependencyIds, String securitySensitivity, String dataClassification, List<String> derivationSource, String derivationMethod, String confidence, String candidateType) {}

  public record ServiceResponsibility(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String serviceCandidateId, String responsibilityStatement) {}

  public record ServiceInterface(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String serviceCandidateId, String interfaceKind, String contract) {}

  public record ServiceEvent(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String serviceCandidateId, String eventType, String payloadHint) {}

  public record OrchestrationStrategyCandidate(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String strategyKind, List<String> linkedServiceIds, List<String> linkedWorkflowIds) {}

  public record ServiceDesign(List<ServiceCandidate> serviceCandidates, List<ServiceResponsibility> responsibilities, List<ServiceInterface> interfaces, List<ServiceEvent> events, List<OrchestrationStrategyCandidate> orchestrationStrategyCandidates) {}

  public record ArchitectureConcern(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String concernKind) {}

  public record ArchitectureDecision(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String decisionType, List<String> optionsConsidered, String selectedOption, String rationale, List<String> linkedNfrIds, List<String> linkedServiceIds, List<String> linkedCapabilityIds, List<String> linkedWorkflowNodeIds, String derivationMethod, boolean analystApprovalRequired, String confidence) {}

  public record ArchitectureInputs(List<ArchitectureConcern> concerns, List<ArchitectureDecision> decisions, List<String> deploymentConstraints, List<String> dataStores) {}

  public record ArchitectureLayer(ServiceDesign serviceDesign, ArchitectureInputs architectureInputs) {}

  public record WorkflowNodeSemantic(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String nodeType, String storyId, String actorId, String capabilityId, List<String> entityIds, List<String> businessRuleIds, String responsibleServiceCandidateId, List<String> derivationRecordIds) {}

  public record WorkflowConnectionSemantic(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String sourceNodeId, String targetNodeId, String connectionType, String conditionExpression) {}

  public record ExecutionResponsibility(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String workflowNodeId, String serviceCandidateId) {}

  public record ExecutionLayer(String id, String name, String description, List<WorkflowNodeSemantic> semanticNodes, List<WorkflowConnectionSemantic> semanticConnections, List<ExecutionResponsibility> executionResponsibilities) {}

  public record Position(int x, int y) {}

  public record Size(int width, int height) {}

  public record WorkflowNodeVisual(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String semanticNodeId, Position position, Size size, String stylePreset) {}

  public record WorkflowConnectionVisual(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String semanticConnectionId, Position labelPosition) {}

  public record VisualizationLayer(List<WorkflowNodeVisual> visualNodes, List<WorkflowConnectionVisual> visualConnections) {}

  public record NonFunctionalRequirements(List<Nfr> requirements) {}

  public record DeployableSolutionInput(String id, String type, String name, String description, String status, Provenance provenance, List<String> tags, String approvalStatus, String targetKind, String targetName, String configurationHint) {}

  public record DeploymentIntentLayer(List<DeployableSolutionInput> targets) {}

  public record TraceLink(String id, String sourceRef, String targetRef, String relationshipType, String rationale, String confidence, String derivationStage, String derivationMethod, String analystApprovalStatus, String validationStatus, String supersedes, String supersededBy) {}

  public record Traceability(List<TraceLink> links) {}

  public record ValidationIssue(String id, String category, String severity, String code, String message, String elementId) {}

  public record Validation(List<ValidationIssue> structural, List<ValidationIssue> semantic, List<ValidationIssue> traceability, List<ValidationIssue> completeness, List<ValidationIssue> evolution) {}
}
