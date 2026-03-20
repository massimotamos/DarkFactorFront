export type SemanticStatus = 'identified' | 'draft' | 'approved' | 'validated' | 'deprecated';
export type GovernanceApprovalStatus = 'proposed' | 'reviewed' | 'approved' | 'rejected' | 'superseded';
export type WorkflowNodeType = 'startEvent' | 'processStep' | 'decisionGateway' | 'systemInteraction' | 'endEvent';
export type WorkflowConnectionType = 'sequence' | 'conditional' | 'integration';
export type ValidationCategory = 'structural' | 'semantic' | 'traceability' | 'completeness' | 'evolution';
export type ValidationSeverity = 'info' | 'warning' | 'error';
export type DerivationStatus = 'pending' | 'proposed' | 'reviewed' | 'approved' | 'rejected' | 'superseded';
export type ValidationStatus = 'unvalidated' | 'validated' | 'invalid';
export type SemanticLayerId =
  | 'intent'
  | 'requirement'
  | 'domain'
  | 'capability'
  | 'architecture'
  | 'execution'
  | 'deployment-intent'
  | 'visualization';
export type DerivationMethod = 'deterministic' | 'rule-based-inferred' | 'ai-heuristic-inferred' | 'analyst-defined' | 'analyst-approved';
export type DerivationStage = 'intent-to-requirement' | 'requirement-to-domain' | 'requirement-to-capability' | 'capability-to-architecture' | 'architecture-to-execution' | 'architecture-to-deployment';

export type SemanticElementType =
  | 'project'
  | 'initiative'
  | 'goal'
  | 'epic'
  | 'userStory'
  | 'acceptanceCriterion'
  | 'businessRule'
  | 'actor'
  | 'domainEntity'
  | 'aggregateGroup'
  | 'domainRelationship'
  | 'capability'
  | 'capabilityGroup'
  | 'serviceCandidate'
  | 'serviceInterface'
  | 'serviceEvent'
  | 'serviceResponsibility'
  | 'workflowNodeSemantic'
  | 'workflowNodeVisual'
  | 'workflowConnectionSemantic'
  | 'workflowConnectionVisual'
  | 'nfr'
  | 'constraint'
  | 'assumption'
  | 'risk'
  | 'architectureConcern'
  | 'architectureDecision'
  | 'orchestrationStrategyCandidate'
  | 'deploymentInput'
  | 'executionResponsibility';

export type TraceRelationshipType =
  | 'initiative_to_epic'
  | 'epic_to_userStory'
  | 'userStory_to_acceptanceCriterion'
  | 'userStory_to_businessRule'
  | 'userStory_to_actor'
  | 'userStory_to_domainEntity'
  | 'userStory_to_capability'
  | 'userStory_to_nfr'
  | 'userStory_to_workflowStep'
  | 'workflowStep_to_capability'
  | 'capability_to_serviceCandidate'
  | 'businessContext_to_architectureConcern'
  | 'nfr_to_serviceCandidate'
  | 'nfr_to_architectureConcern'
  | 'workflowNode_to_serviceCandidate'
  | 'serviceCandidate_to_deploymentInput'
  | 'risk_to_affectedElement';

export interface ElementProvenance {
  source: 'analyst' | 'architect' | 'system' | 'import';
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalElement {
  id: string;
  type: SemanticElementType;
  name: string;
  description: string;
  status: SemanticStatus;
  provenance: ElementProvenance;
  tags: string[];
  approvalStatus?: GovernanceApprovalStatus;
}

export interface SemanticLayerDefinition {
  id: SemanticLayerId;
  name: string;
  purpose: string;
  upstreamDependencies: SemanticLayerId[];
  downstreamDerivationTargets: SemanticLayerId[];
}

export interface DerivationRuleRecord {
  id: string;
  name: string;
  sourceLayer: SemanticLayerId;
  targetLayer: SemanticLayerId;
  sourceTypes: SemanticElementType[];
  targetTypes: SemanticElementType[];
  derivationMethod: DerivationMethod;
  analystApprovalRequired: boolean;
  description: string;
}

export interface DerivationRecord {
  id: string;
  ruleId: string;
  sourceRefs: string[];
  targetRefs: string[];
  derivationStage: DerivationStage;
  derivationStatus: DerivationStatus;
  derivationMethod: DerivationMethod;
  analystApprovalRequired: boolean;
  analystApprovalStatus: GovernanceApprovalStatus;
  confidence: 'low' | 'medium' | 'high';
  rationale: string;
  validationStatus: ValidationStatus;
  supersedes: string | null;
  supersededBy: string | null;
}

export interface DerivationModel {
  derivationRules: DerivationRuleRecord[];
  derivationRecords: DerivationRecord[];
}

export interface PlatformMetadata {
  schemaId: 'darkfactor.platform.dsl';
  schemaVersion: '4.1.0';
  documentKind: 'business-intent-to-executable-system-specification';
  source: 'angular-workbench';
}

export interface VersioningModel {
  documentVersion: number;
  createdAt: string;
  updatedAt: string;
  migrationState: 'native' | 'requires-upgrade' | 'upgrade-in-progress';
  targetSchemaVersion: string | null;
  changeSummary: string;
}

export interface PlatformProjectRecord extends CanonicalElement {
  slug: string;
}

export interface GoalRecord extends CanonicalElement {
  metric: string;
}

export interface InitiativeRecord extends CanonicalElement {
  key: string;
  summary: string;
  vision: string;
  targetOutcomes: string[];
  goalIds: string[];
}

export interface BusinessContextRecord {
  id: string;
  industry: string;
  businessDomain: string;
  problemStatement: string;
  businessValue: string;
  stakeholders: string[];
  operatingModel: string;
  regulatoryContext: string[];
  expectedOutcomes: string[];
}

export interface ConstraintRecord extends CanonicalElement {
  category: 'regulatory' | 'organizational' | 'technical';
}

export interface AssumptionRecord extends CanonicalElement {
  confidence: 'low' | 'medium' | 'high';
}

export interface RiskRecord extends CanonicalElement {
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface EpicRecord extends CanonicalElement {
  initiativeId: string;
  key: string;
  businessOutcome: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AcceptanceCriterionRecord extends CanonicalElement {
  userStoryId: string;
  fitCriterion: string;
}

export interface BusinessRuleRecord extends CanonicalElement {
  ruleExpression: string;
  ruleKind: 'decision' | 'validation' | 'policy';
}

export interface UserStoryRecord extends CanonicalElement {
  initiativeId: string;
  epicId: string;
  key: string;
  narrative: string;
  businessValue: string;
  actorIds: string[];
  acceptanceCriterionIds: string[];
  businessRuleIds: string[];
  domainEntityIds: string[];
  capabilityIds: string[];
  nfrIds: string[];
  workflowNodeIds: string[];
}

export interface BacklogRecord {
  epics: EpicRecord[];
  userStories: UserStoryRecord[];
  acceptanceCriteria: AcceptanceCriterionRecord[];
  businessRules: BusinessRuleRecord[];
}

export interface ActorRecord extends CanonicalElement {
  actorKind: 'human' | 'system' | 'external';
  responsibilities: string[];
}

export interface DomainEntityRecord extends CanonicalElement {
  entityKind: 'aggregate' | 'reference' | 'event';
  attributes: Array<{ name: string; type: string; required: boolean }>;
}

export interface AggregateGroupRecord extends CanonicalElement {
  entityIds: string[];
}

export interface DomainRelationshipRecord extends CanonicalElement {
  sourceEntityId: string;
  targetEntityId: string;
  relationshipKind: 'association' | 'ownership' | 'reference' | 'composition';
}

export interface DomainModelRecord {
  actors: ActorRecord[];
  domainEntities: DomainEntityRecord[];
  aggregateGroups: AggregateGroupRecord[];
  domainRelationships: DomainRelationshipRecord[];
}

export interface CapabilityRecord extends CanonicalElement {
  capabilityKind: 'business' | 'application' | 'integration';
  businessOutcome: string;
}

export interface CapabilityGroupRecord extends CanonicalElement {
  capabilityIds: string[];
}

export interface CapabilityModelRecord {
  capabilities: CapabilityRecord[];
  capabilityGroups: CapabilityGroupRecord[];
}

export interface ServiceResponsibilityRecord extends CanonicalElement {
  serviceCandidateId: string;
  responsibilityStatement: string;
}

export interface ServiceInterfaceRecord extends CanonicalElement {
  serviceCandidateId: string;
  interfaceKind: 'rest-command' | 'query' | 'async-command';
  contract: string;
}

export interface ServiceEventRecord extends CanonicalElement {
  serviceCandidateId: string;
  eventType: 'domain-event' | 'integration-event';
  payloadHint: string;
}

export interface ServiceCandidateRecord extends CanonicalElement {
  boundedDomainName: string;
  responsibilityStatement: string;
  ownedEntityIds: string[];
  supportedCapabilityIds: string[];
  inboundInterfaceIds: string[];
  outboundEventIds: string[];
  dependencyIds: string[];
  securitySensitivity: 'low' | 'medium' | 'high';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  derivationSource: string[];
  derivationMethod: DerivationMethod;
  confidence: 'low' | 'medium' | 'high';
  candidateType: 'domain-service' | 'orchestration-service' | 'integration-service' | 'supporting-service';
}

export interface OrchestrationStrategyCandidateRecord extends CanonicalElement {
  strategyKind: 'orchestration' | 'choreography' | 'hybrid';
  linkedServiceIds: string[];
  linkedWorkflowIds: string[];
}

export interface ServiceDesignRecord {
  serviceCandidates: ServiceCandidateRecord[];
  responsibilities: ServiceResponsibilityRecord[];
  interfaces: ServiceInterfaceRecord[];
  events: ServiceEventRecord[];
  orchestrationStrategyCandidates: OrchestrationStrategyCandidateRecord[];
}

export interface WorkflowNodeSemanticRecord extends CanonicalElement {
  nodeType: WorkflowNodeType;
  storyId: string | null;
  actorId: string | null;
  capabilityId: string | null;
  entityIds: string[];
  businessRuleIds: string[];
  responsibleServiceCandidateId: string | null;
  derivationRecordIds: string[];
}

export interface WorkflowNodeVisualRecord extends CanonicalElement {
  semanticNodeId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  stylePreset: 'start' | 'activity' | 'decision' | 'integration' | 'end';
}

export interface WorkflowConnectionSemanticRecord extends CanonicalElement {
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: WorkflowConnectionType;
  conditionExpression: string | null;
}

export interface WorkflowConnectionVisualRecord extends CanonicalElement {
  semanticConnectionId: string;
  labelPosition: { x: number; y: number };
}

export interface ExecutionResponsibilityRecord extends CanonicalElement {
  workflowNodeId: string;
  serviceCandidateId: string;
}

export interface WorkflowModelRecord {
  id: string;
  name: string;
  description: string;
  semanticNodes: WorkflowNodeSemanticRecord[];
  semanticConnections: WorkflowConnectionSemanticRecord[];
  executionResponsibilities: ExecutionResponsibilityRecord[];
  visualNodes: WorkflowNodeVisualRecord[];
  visualConnections: WorkflowConnectionVisualRecord[];
}

export interface ExecutionLayerRecord {
  id: string;
  name: string;
  description: string;
  semanticNodes: WorkflowNodeSemanticRecord[];
  semanticConnections: WorkflowConnectionSemanticRecord[];
  executionResponsibilities: ExecutionResponsibilityRecord[];
}

export interface VisualizationLayerRecord {
  visualNodes: WorkflowNodeVisualRecord[];
  visualConnections: WorkflowConnectionVisualRecord[];
}

export interface NfrRecord extends CanonicalElement {
  category: 'security' | 'performance' | 'resilience' | 'observability' | 'auditability' | 'compliance' | 'scalability' | 'maintainability';
  measure: string;
}

export interface NonFunctionalRequirementsRecord {
  requirements: NfrRecord[];
}

export interface ArchitectureConcernRecord extends CanonicalElement {
  concernKind: 'security' | 'scalability' | 'operability' | 'auditability' | 'integration' | 'deployment';
}

export interface ArchitectureDecisionRecord extends CanonicalElement {
  decisionType: 'service-boundary' | 'orchestration-strategy' | 'integration-style' | 'security-architecture';
  optionsConsidered: string[];
  selectedOption: string;
  rationale: string;
  linkedNfrIds: string[];
  linkedServiceIds: string[];
  linkedCapabilityIds: string[];
  linkedWorkflowNodeIds: string[];
  derivationMethod: DerivationMethod;
  analystApprovalRequired: boolean;
  confidence: 'low' | 'medium' | 'high';
}

export interface ArchitectureInputsRecord {
  concerns: ArchitectureConcernRecord[];
  decisions: ArchitectureDecisionRecord[];
  deploymentConstraints: string[];
  dataStores: string[];
}

export interface DeployableSolutionInputRecord extends CanonicalElement {
  targetKind: 'spring-boot-service' | 'angular-ui' | 'postgres-schema' | 'kafka-topology' | 'keycloak-plan' | 'kubernetes-manifest';
  targetName: string;
  configurationHint: string;
}

export interface DeployableSolutionInputsRecord {
  targets: DeployableSolutionInputRecord[];
}

export interface TraceabilityLinkRecord {
  id: string;
  sourceRef: string;
  targetRef: string;
  relationshipType: TraceRelationshipType;
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
  derivationStage: DerivationStage;
  derivationMethod: DerivationMethod;
  analystApprovalStatus: GovernanceApprovalStatus;
  validationStatus: ValidationStatus;
  supersedes: string | null;
  supersededBy: string | null;
}

export interface TraceabilityRecord {
  links: TraceabilityLinkRecord[];
}

export interface ValidationIssueRecord {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  code: string;
  message: string;
  elementId: string | null;
}

export interface ValidationRecord {
  structural: ValidationIssueRecord[];
  semantic: ValidationIssueRecord[];
  traceability: ValidationIssueRecord[];
  completeness: ValidationIssueRecord[];
  evolution: ValidationIssueRecord[];
}

export interface PlatformDslDocument {
  metadata: PlatformMetadata;
  semanticLayers: SemanticLayerDefinition[];
  derivationModel: DerivationModel;
  versioning: VersioningModel;
  project: PlatformProjectRecord;
  intentLayer: {
    initiative: InitiativeRecord;
    goals: GoalRecord[];
    businessContext: BusinessContextRecord;
  };
  requirementLayer: {
    backlog: BacklogRecord;
    nonFunctionalRequirements: NonFunctionalRequirementsRecord;
    constraints: ConstraintRecord[];
    assumptions: AssumptionRecord[];
    risks: RiskRecord[];
  };
  domainLayer: DomainModelRecord;
  capabilityLayer: CapabilityModelRecord;
  architectureLayer: {
    serviceDesign: ServiceDesignRecord;
    architectureInputs: ArchitectureInputsRecord;
  };
  executionLayer: ExecutionLayerRecord;
  deploymentIntentLayer: DeployableSolutionInputsRecord;
  visualizationLayer: VisualizationLayerRecord;
  traceability: TraceabilityRecord;
  validation: ValidationRecord;
}

export interface ValidationReport {
  issues: ValidationIssueRecord[];
  byCategory: Record<ValidationCategory, ValidationIssueRecord[]>;
}

export interface NodeTemplate {
  type: WorkflowNodeType;
  label: string;
  description: string;
  accent: string;
}
