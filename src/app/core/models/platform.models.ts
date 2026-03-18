export type SemanticStatus = 'identified' | 'draft' | 'approved' | 'validated' | 'deprecated';
export type WorkflowNodeType = 'startEvent' | 'processStep' | 'decisionGateway' | 'systemInteraction' | 'endEvent';
export type WorkflowConnectionType = 'sequence' | 'conditional' | 'integration';
export type ValidationCategory =
  | 'structural'
  | 'semantic'
  | 'traceability'
  | 'completeness'
  | 'evolution';
export type ValidationSeverity = 'info' | 'warning' | 'error';
export type SemanticElementType =
  | 'project'
  | 'initiative'
  | 'epic'
  | 'userStory'
  | 'acceptanceCriterion'
  | 'businessRule'
  | 'actor'
  | 'domainEntity'
  | 'aggregateGroup'
  | 'capability'
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
  | 'deploymentInput';
export type TraceRelationshipType =
  | 'initiative_to_epic'
  | 'epic_to_userStory'
  | 'userStory_to_acceptanceCriterion'
  | 'userStory_to_businessRule'
  | 'userStory_to_actor'
  | 'userStory_to_domainEntity'
  | 'userStory_to_workflowStep'
  | 'workflowStep_to_capability'
  | 'capability_to_serviceCandidate'
  | 'nfr_to_serviceCandidate'
  | 'nfr_to_architectureConcern'
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
}

export interface PlatformMetadata {
  schemaId: 'darkfactor.platform.dsl';
  schemaVersion: '3.0.0';
  documentKind: 'business-to-system-canonical-specification';
  source: 'angular-workbench';
}

export interface VersioningModel {
  documentVersion: number;
  createdAt: string;
  updatedAt: string;
  migrationState: 'native' | 'requires-upgrade' | 'upgrade-in-progress';
  changeSummary: string;
}

export interface PlatformProjectRecord extends CanonicalElement {
  slug: string;
}

export interface InitiativeRecord extends CanonicalElement {
  key: string;
  summary: string;
  vision: string;
  targetOutcomes: string[];
}

export interface BusinessContextRecord {
  industry: string;
  businessDomain: string;
  problemStatement: string;
  businessValue: string;
  stakeholders: string[];
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

export interface DomainModelRecord {
  actors: ActorRecord[];
  domainEntities: DomainEntityRecord[];
  aggregateGroups: AggregateGroupRecord[];
}

export interface CapabilityRecord extends CanonicalElement {
  capabilityKind: 'business' | 'application' | 'integration';
  businessOutcome: string;
}

export interface CapabilityModelRecord {
  capabilities: CapabilityRecord[];
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
}

export interface ServiceDesignRecord {
  serviceCandidates: ServiceCandidateRecord[];
  responsibilities: ServiceResponsibilityRecord[];
  interfaces: ServiceInterfaceRecord[];
  events: ServiceEventRecord[];
}

export interface WorkflowNodeSemanticRecord extends CanonicalElement {
  nodeType: WorkflowNodeType;
  storyId: string | null;
  actorId: string | null;
  capabilityId: string | null;
  entityIds: string[];
  businessRuleIds: string[];
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

export interface WorkflowModelRecord {
  id: string;
  name: string;
  description: string;
  semanticNodes: WorkflowNodeSemanticRecord[];
  visualNodes: WorkflowNodeVisualRecord[];
  semanticConnections: WorkflowConnectionSemanticRecord[];
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

export interface ArchitectureInputsRecord {
  concerns: ArchitectureConcernRecord[];
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
  versioning: VersioningModel;
  project: PlatformProjectRecord;
  initiative: InitiativeRecord;
  businessContext: BusinessContextRecord;
  backlog: BacklogRecord;
  domainModel: DomainModelRecord;
  capabilityModel: CapabilityModelRecord;
  serviceDesign: ServiceDesignRecord;
  workflowModel: WorkflowModelRecord;
  nonFunctionalRequirements: NonFunctionalRequirementsRecord;
  constraints: ConstraintRecord[];
  assumptions: AssumptionRecord[];
  risks: RiskRecord[];
  architectureInputs: ArchitectureInputsRecord;
  deployableSolutionInputs: DeployableSolutionInputsRecord;
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
