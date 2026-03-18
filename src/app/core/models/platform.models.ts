export type SemanticStatus = 'identified' | 'draft' | 'approved' | 'validated' | 'deprecated';
export type WorkflowNodeType = 'startEvent' | 'processStep' | 'decisionGateway' | 'systemInteraction' | 'endEvent';
export type TraceLinkType =
  | 'initiative_to_epic'
  | 'epic_to_user_story'
  | 'user_story_to_acceptance_criterion'
  | 'user_story_to_workflow_step'
  | 'workflow_step_to_capability'
  | 'capability_to_service_candidate'
  | 'user_story_to_domain_entity'
  | 'user_story_to_business_rule'
  | 'initiative_to_nfr'
  | 'nfr_to_architecture_concern';
export type ValidationCategory =
  | 'structural'
  | 'semantic'
  | 'traceability'
  | 'requirement-completeness';
export type ValidationSeverity = 'info' | 'warning' | 'error';
export type SemanticElementType =
  | 'project'
  | 'initiative'
  | 'actor'
  | 'constraint'
  | 'assumption'
  | 'risk'
  | 'epic'
  | 'userStory'
  | 'acceptanceCriterion'
  | 'businessRule'
  | 'workflowNode'
  | 'domainEntity'
  | 'capability'
  | 'serviceCandidate'
  | 'nfr'
  | 'architectureConcern';

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
}

export interface PlatformMetadata {
  schemaId: 'darkfactor.platform.dsl';
  schemaVersion: '2.0.0';
  documentKind: 'canonical-specification';
  source: 'angular-workbench';
  exportedAt: string;
}

export interface VersioningModel {
  documentVersion: number;
  baselineVersion: string;
  migrationReadiness: 'native' | 'requires-upgrade';
  changeInfo: {
    summary: string;
    changedBy: string;
    changedAt: string;
  };
}

export interface PlatformProjectRecord extends CanonicalElement {
  slug: string;
}

export interface InitiativeRecord extends CanonicalElement {
  key: string;
  summary: string;
  vision: string;
}

export interface ActorRecord extends CanonicalElement {
  actorKind: 'human' | 'system' | 'external';
  responsibilities: string[];
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

export interface BusinessContextRecord {
  domain: string;
  problemStatement: string;
  targetOutcome: string;
  actors: ActorRecord[];
  constraints: ConstraintRecord[];
  assumptions: AssumptionRecord[];
  risks: RiskRecord[];
}

export interface EpicRecord extends CanonicalElement {
  initiativeId: string;
  key: string;
  outcome: string;
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
  acceptanceCriteria: AcceptanceCriterionRecord[];
  businessRuleIds: string[];
  domainEntityIds: string[];
}

export interface BacklogRecord {
  epics: EpicRecord[];
  userStories: UserStoryRecord[];
  businessRules: BusinessRuleRecord[];
}

export interface DomainEntityRecord extends CanonicalElement {
  entityKind: 'aggregate' | 'reference' | 'event';
  attributes: Array<{ name: string; type: string; required: boolean }>;
}

export interface DomainModelRecord {
  entities: DomainEntityRecord[];
}

export interface CapabilityRecord extends CanonicalElement {
  capabilityKind: 'business' | 'application' | 'integration';
  outcome: string;
}

export interface CapabilityModelRecord {
  capabilities: CapabilityRecord[];
}

export interface ServiceCandidateRecord extends CanonicalElement {
  capabilityIds: string[];
  serviceStyle: 'module' | 'application-service' | 'integration-adapter';
}

export interface ArchitectureConcernRecord extends CanonicalElement {
  concernKind: 'security' | 'scalability' | 'operability' | 'auditability';
}

export interface ServiceDesignRecord {
  serviceCandidates: ServiceCandidateRecord[];
  architectureConcerns: ArchitectureConcernRecord[];
}

export interface NfrRecord extends CanonicalElement {
  qualityAttribute: 'security' | 'performance' | 'availability' | 'auditability' | 'maintainability';
  measure: string;
}

export interface NonFunctionalRequirementsRecord {
  requirements: NfrRecord[];
}

export interface WorkflowNodeSemanticRecord extends CanonicalElement {
  nodeType: WorkflowNodeType;
  actorId: string | null;
  storyId: string | null;
  businessRuleIds: string[];
  capabilityId: string | null;
  serviceCandidateId: string | null;
}

export interface WorkflowNodeVisualRecord {
  nodeId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface WorkflowConnectionRecord {
  id: string;
  type: 'sequence' | 'conditional' | 'integration';
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
}

export interface WorkflowModelRecord {
  id: string;
  name: string;
  description: string;
  semanticNodes: WorkflowNodeSemanticRecord[];
  visualNodes: WorkflowNodeVisualRecord[];
  connections: WorkflowConnectionRecord[];
}

export interface TraceabilityLinkRecord {
  id: string;
  type: TraceLinkType;
  sourceId: string;
  targetId: string;
  rationale: string;
  provenance: ElementProvenance;
}

export interface TraceabilityRecord {
  relationships: TraceabilityLinkRecord[];
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
  requirementCompleteness: ValidationIssueRecord[];
}

export interface PlatformDslDocument {
  metadata: PlatformMetadata;
  versioning: VersioningModel;
  project: PlatformProjectRecord;
  initiative: InitiativeRecord;
  businessContext: BusinessContextRecord;
  backlog: BacklogRecord;
  workflowModel: WorkflowModelRecord;
  domainModel: DomainModelRecord;
  capabilityModel: CapabilityModelRecord;
  serviceDesign: ServiceDesignRecord;
  nonFunctionalRequirements: NonFunctionalRequirementsRecord;
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
