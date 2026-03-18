import { computed, Injectable, signal } from '@angular/core';
import {
  AcceptanceCriterionRecord,
  ActorRecord,
  ArchitectureConcernRecord,
  AssumptionRecord,
  BacklogRecord,
  BusinessContextRecord,
  BusinessRuleRecord,
  CapabilityRecord,
  CanonicalElement,
  ConstraintRecord,
  DomainEntityRecord,
  EpicRecord,
  InitiativeRecord,
  NfrRecord,
  NodeTemplate,
  PlatformDslDocument,
  PlatformProjectRecord,
  RiskRecord,
  SemanticElementType,
  ServiceCandidateRecord,
  TraceLinkType,
  TraceabilityLinkRecord,
  ValidationIssueRecord,
  ValidationReport,
  WorkflowConnectionRecord,
  WorkflowNodeSemanticRecord,
  WorkflowNodeType,
  WorkflowNodeVisualRecord,
  UserStoryRecord
} from '../models/platform.models';
import { PlatformDslService } from '../services/platform-dsl.service';
import { PlatformValidationService } from '../services/platform-validation.service';

function provenance(author: string): CanonicalElement['provenance'] {
  const now = '2026-03-18T10:00:00Z';
  return {
    source: 'analyst',
    author,
    createdAt: now,
    updatedAt: now
  };
}

function baseElement(
  id: string,
  type: SemanticElementType,
  name: string,
  description: string,
  status: CanonicalElement['status'] = 'draft'
): CanonicalElement {
  return {
    id,
    type,
    name,
    description,
    status,
    provenance: provenance('platform-seed')
  };
}

const ACTOR_APPLICANT: ActorRecord = {
  ...baseElement('actor-applicant', 'actor', 'Applicant', 'Customer applying for onboarding.', 'approved'),
  actorKind: 'human',
  responsibilities: ['Provide onboarding information', 'Respond to verification prompts']
};

const ACTOR_COMPLIANCE: ActorRecord = {
  ...baseElement('actor-compliance', 'actor', 'Compliance Analyst', 'Reviews escalated onboarding cases.', 'approved'),
  actorKind: 'human',
  responsibilities: ['Review flagged applications', 'Approve or reject escalations']
};

const CONSTRAINT_AUDIT: ConstraintRecord = {
  ...baseElement('constraint-audit', 'constraint', 'Audit Retention', 'All significant onboarding decisions must be auditable.', 'approved'),
  category: 'regulatory'
};

const ASSUMPTION_IDM: AssumptionRecord = {
  ...baseElement('assumption-idm', 'assumption', 'Identity Broker Later', 'Keycloak integration will be added in a later increment.', 'draft'),
  confidence: 'high'
};

const RISK_REVIEW: RiskRecord = {
  ...baseElement('risk-review-bottleneck', 'risk', 'Manual Review Bottleneck', 'Compliance review could become the throughput bottleneck.', 'draft'),
  impact: 'high',
  mitigation: 'Introduce explicit capability and service candidates for review orchestration.'
};

const BUSINESS_RULE_RISK: BusinessRuleRecord = {
  ...baseElement('rule-risk-threshold', 'businessRule', 'Risk Threshold Rule', 'High-risk applications require compliance review.', 'approved'),
  ruleExpression: 'if applicantRiskScore >= 70 then requireComplianceReview = true',
  ruleKind: 'decision'
};

const ACCEPTANCE_CAPTURE: AcceptanceCriterionRecord = {
  ...baseElement('ac-profile-captured', 'acceptanceCriterion', 'Profile Captured', 'Applicant profile data is collected completely.', 'approved'),
  userStoryId: 'story-intake-1',
  fitCriterion: 'Mandatory applicant identity and profile fields are present.'
};

const ACCEPTANCE_ESCALATE: AcceptanceCriterionRecord = {
  ...baseElement('ac-risk-escalation', 'acceptanceCriterion', 'Risk Escalation', 'High-risk cases are routed to compliance.', 'approved'),
  userStoryId: 'story-risk-1',
  fitCriterion: 'A high-risk workflow branch triggers review case creation.'
};

const DOMAIN_ENTITY_APPLICATION: DomainEntityRecord = {
  ...baseElement('entity-onboarding-application', 'domainEntity', 'OnboardingApplication', 'Aggregate root for customer onboarding.', 'approved'),
  entityKind: 'aggregate',
  attributes: [
    { name: 'applicationId', type: 'UUID', required: true },
    { name: 'customerId', type: 'UUID', required: true },
    { name: 'riskScore', type: 'Integer', required: true }
  ]
};

const DOMAIN_ENTITY_REVIEW_CASE: DomainEntityRecord = {
  ...baseElement('entity-review-case', 'domainEntity', 'ComplianceReviewCase', 'Represents compliance review work.', 'approved'),
  entityKind: 'aggregate',
  attributes: [
    { name: 'caseId', type: 'UUID', required: true },
    { name: 'applicationId', type: 'UUID', required: true },
    { name: 'status', type: 'String', required: true }
  ]
};

const CAPABILITY_CAPTURE: CapabilityRecord = {
  ...baseElement('capability-capture-intake', 'capability', 'Capture Intake Data', 'Capture onboarding data for applicants.', 'approved'),
  capabilityKind: 'business',
  outcome: 'The onboarding application is recorded as a formal domain object.'
};

const CAPABILITY_ROUTE_REVIEW: CapabilityRecord = {
  ...baseElement('capability-route-review', 'capability', 'Route Compliance Review', 'Route high-risk applications to review.', 'approved'),
  capabilityKind: 'application',
  outcome: 'Review routing is explicit and generation-ready.'
};

const SERVICE_INTAKE: ServiceCandidateRecord = {
  ...baseElement('service-intake-orchestrator', 'serviceCandidate', 'Intake Orchestrator', 'Coordinates onboarding capture workflow.', 'draft'),
  capabilityIds: ['capability-capture-intake'],
  serviceStyle: 'application-service'
};

const SERVICE_REVIEW: ServiceCandidateRecord = {
  ...baseElement('service-review-routing', 'serviceCandidate', 'Review Routing Service', 'Creates and routes review cases.', 'draft'),
  capabilityIds: ['capability-route-review'],
  serviceStyle: 'application-service'
};

const CONCERN_AUDIT: ArchitectureConcernRecord = {
  ...baseElement('concern-auditability', 'architectureConcern', 'Auditability', 'Architecture must preserve decision evidence.', 'approved'),
  concernKind: 'auditability'
};

const NFR_AUDIT: NfrRecord = {
  ...baseElement('nfr-audit-trail', 'nfr', 'End-to-End Audit Trail', 'All onboarding decisions must be traceable.', 'approved'),
  qualityAttribute: 'auditability',
  measure: 'Decision records and review transitions must be persisted for 7 years.'
};

const DEFAULT_DOCUMENT: PlatformDslDocument = {
  metadata: {
    schemaId: 'darkfactor.platform.dsl',
    schemaVersion: '2.0.0',
    documentKind: 'canonical-specification',
    source: 'angular-workbench',
    exportedAt: '2026-03-18T10:00:00Z'
  },
  versioning: {
    documentVersion: 2,
    baselineVersion: '1.0.0',
    migrationReadiness: 'native',
    changeInfo: {
      summary: 'Upgraded to semantic canonical DSL with traceability.',
      changedBy: 'platform-seed',
      changedAt: '2026-03-18T10:00:00Z'
    }
  },
  project: {
    ...baseElement('project-customer-onboarding', 'project', 'Customer Onboarding Platform', 'Canonical modeling workspace for onboarding.', 'approved'),
    slug: 'customer-onboarding-platform'
  },
  initiative: {
    ...baseElement('initiative-digital-onboarding', 'initiative', 'Digital Customer Onboarding', 'Formal business initiative for onboarding transformation.', 'approved'),
    key: 'INIT-001',
    summary: 'Reduce onboarding lead time and standardize approvals across channels.',
    vision: 'Turn onboarding requirements into a canonical generation-ready specification.'
  },
  businessContext: {
    domain: 'Retail Banking',
    problemStatement: 'Customer onboarding is fragmented across email, spreadsheets, and branch workflows.',
    targetOutcome: 'Create a unified onboarding operating model with auditable requirements and workflow visualization.',
    actors: [ACTOR_APPLICANT, ACTOR_COMPLIANCE],
    constraints: [CONSTRAINT_AUDIT],
    assumptions: [ASSUMPTION_IDM],
    risks: [RISK_REVIEW]
  },
  backlog: {
    epics: [
      {
        ...baseElement('epic-intake', 'epic', 'Capture customer intake', 'Model the intake path and mandatory data collection.', 'approved'),
        initiativeId: 'initiative-digital-onboarding',
        key: 'EPC-001',
        outcome: 'Analysts can formalize intake requirements before implementation.',
        priority: 'critical'
      },
      {
        ...baseElement('epic-risk', 'epic', 'Route risk review', 'Express conditional review logic for compliance workflows.', 'approved'),
        initiativeId: 'initiative-digital-onboarding',
        key: 'EPC-002',
        outcome: 'Downstream solutions can generate approval orchestration safely.',
        priority: 'high'
      }
    ],
    userStories: [
      {
        ...baseElement('story-intake-1', 'userStory', 'Collect applicant profile', 'Applicant intake is modeled as structured workflow behavior.', 'approved'),
        initiativeId: 'initiative-digital-onboarding',
        epicId: 'epic-intake',
        key: 'USR-001',
        narrative: 'As a business analyst I need applicant intake modeled so data requirements remain traceable.',
        acceptanceCriteria: [ACCEPTANCE_CAPTURE],
        businessRuleIds: [],
        domainEntityIds: ['entity-onboarding-application']
      },
      {
        ...baseElement('story-risk-1', 'userStory', 'Escalate high-risk cases', 'Manual review paths are explicit in the canonical model.', 'approved'),
        initiativeId: 'initiative-digital-onboarding',
        epicId: 'epic-risk',
        key: 'USR-002',
        narrative: 'As a compliance lead I need risk decisions modeled so manual review paths are explicit.',
        acceptanceCriteria: [ACCEPTANCE_ESCALATE],
        businessRuleIds: ['rule-risk-threshold'],
        domainEntityIds: ['entity-review-case', 'entity-onboarding-application']
      }
    ],
    businessRules: [BUSINESS_RULE_RISK]
  },
  workflowModel: {
    id: 'workflow-onboarding-v2',
    name: 'Onboarding Flow',
    description: 'Semantic workflow model with a separate canvas projection.',
    semanticNodes: [
      {
        ...baseElement('node-start', 'workflowNode', 'Customer Onboarding Start', 'Entry point for onboarding.', 'approved'),
        nodeType: 'startEvent',
        actorId: 'actor-applicant',
        storyId: 'story-intake-1',
        businessRuleIds: [],
        capabilityId: null,
        serviceCandidateId: null
      },
      {
        ...baseElement('node-intake', 'workflowNode', 'Capture Applicant Profile', 'Collect the customer intake form.', 'approved'),
        nodeType: 'processStep',
        actorId: 'actor-applicant',
        storyId: 'story-intake-1',
        businessRuleIds: [],
        capabilityId: 'capability-capture-intake',
        serviceCandidateId: 'service-intake-orchestrator'
      },
      {
        ...baseElement('node-decision', 'workflowNode', 'Evaluate Risk', 'Determine if compliance review is required.', 'approved'),
        nodeType: 'decisionGateway',
        actorId: 'actor-compliance',
        storyId: 'story-risk-1',
        businessRuleIds: ['rule-risk-threshold'],
        capabilityId: 'capability-route-review',
        serviceCandidateId: 'service-review-routing'
      },
      {
        ...baseElement('node-review', 'workflowNode', 'Notify Compliance', 'Send high-risk cases to compliance operations.', 'approved'),
        nodeType: 'systemInteraction',
        actorId: 'actor-compliance',
        storyId: 'story-risk-1',
        businessRuleIds: ['rule-risk-threshold'],
        capabilityId: 'capability-route-review',
        serviceCandidateId: 'service-review-routing'
      },
      {
        ...baseElement('node-end', 'workflowNode', 'Onboarding Submitted', 'Workflow terminates with a recorded submission.', 'approved'),
        nodeType: 'endEvent',
        actorId: null,
        storyId: 'story-intake-1',
        businessRuleIds: [],
        capabilityId: null,
        serviceCandidateId: null
      }
    ],
    visualNodes: [
      thisVisual('node-start', 80, 160, 160, 72),
      thisVisual('node-intake', 310, 145, 220, 96),
      thisVisual('node-decision', 590, 140, 190, 106),
      thisVisual('node-review', 850, 145, 230, 96),
      thisVisual('node-end', 1130, 160, 160, 72)
    ],
    connections: [
      thisConnection('conn-1', 'node-start', 'node-intake', 'begin', 'sequence'),
      thisConnection('conn-2', 'node-intake', 'node-decision', 'submitted', 'sequence'),
      thisConnection('conn-3', 'node-decision', 'node-review', 'high risk', 'conditional'),
      thisConnection('conn-4', 'node-review', 'node-end', 'case opened', 'integration')
    ]
  },
  domainModel: {
    entities: [DOMAIN_ENTITY_APPLICATION, DOMAIN_ENTITY_REVIEW_CASE]
  },
  capabilityModel: {
    capabilities: [CAPABILITY_CAPTURE, CAPABILITY_ROUTE_REVIEW]
  },
  serviceDesign: {
    serviceCandidates: [SERVICE_INTAKE, SERVICE_REVIEW],
    architectureConcerns: [CONCERN_AUDIT]
  },
  nonFunctionalRequirements: {
    requirements: [NFR_AUDIT]
  },
  traceability: {
    relationships: [
      thisTrace('trace-1', 'initiative_to_epic', 'initiative-digital-onboarding', 'epic-intake', 'Initiative drives intake epic.'),
      thisTrace('trace-2', 'initiative_to_epic', 'initiative-digital-onboarding', 'epic-risk', 'Initiative drives risk epic.'),
      thisTrace('trace-3', 'epic_to_user_story', 'epic-intake', 'story-intake-1', 'Epic decomposes into story.'),
      thisTrace('trace-4', 'epic_to_user_story', 'epic-risk', 'story-risk-1', 'Epic decomposes into story.'),
      thisTrace('trace-5', 'user_story_to_acceptance_criterion', 'story-intake-1', 'ac-profile-captured', 'Story has formal fit criterion.'),
      thisTrace('trace-6', 'user_story_to_acceptance_criterion', 'story-risk-1', 'ac-risk-escalation', 'Story has escalation criterion.'),
      thisTrace('trace-7', 'user_story_to_workflow_step', 'story-intake-1', 'node-intake', 'Story manifests as intake step.'),
      thisTrace('trace-8', 'user_story_to_workflow_step', 'story-risk-1', 'node-decision', 'Story manifests as risk decision.'),
      thisTrace('trace-9', 'workflow_step_to_capability', 'node-intake', 'capability-capture-intake', 'Workflow step realizes capture capability.'),
      thisTrace('trace-10', 'workflow_step_to_capability', 'node-decision', 'capability-route-review', 'Risk routing node realizes routing capability.'),
      thisTrace('trace-11', 'capability_to_service_candidate', 'capability-capture-intake', 'service-intake-orchestrator', 'Capability maps to service candidate.'),
      thisTrace('trace-12', 'capability_to_service_candidate', 'capability-route-review', 'service-review-routing', 'Capability maps to service candidate.'),
      thisTrace('trace-13', 'user_story_to_domain_entity', 'story-intake-1', 'entity-onboarding-application', 'Story creates onboarding application aggregate.'),
      thisTrace('trace-14', 'user_story_to_domain_entity', 'story-risk-1', 'entity-review-case', 'Story creates review case aggregate.'),
      thisTrace('trace-15', 'user_story_to_business_rule', 'story-risk-1', 'rule-risk-threshold', 'Story depends on risk policy.'),
      thisTrace('trace-16', 'initiative_to_nfr', 'initiative-digital-onboarding', 'nfr-audit-trail', 'Initiative requires auditability.'),
      thisTrace('trace-17', 'nfr_to_architecture_concern', 'nfr-audit-trail', 'concern-auditability', 'NFR informs architecture concern.')
    ]
  },
  validation: {
    structural: [],
    semantic: [],
    traceability: [],
    requirementCompleteness: []
  }
};

function thisVisual(nodeId: string, x: number, y: number, width: number, height: number): WorkflowNodeVisualRecord {
  return { nodeId, position: { x, y }, size: { width, height } };
}

function thisConnection(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  label: string,
  type: WorkflowConnectionRecord['type']
): WorkflowConnectionRecord {
  return { id, sourceNodeId, targetNodeId, label, type };
}

function thisTrace(
  id: string,
  type: TraceLinkType,
  sourceId: string,
  targetId: string,
  rationale: string
): TraceabilityLinkRecord {
  return {
    id,
    type,
    sourceId,
    targetId,
    rationale,
    provenance: provenance('platform-seed')
  };
}

@Injectable({ providedIn: 'root' })
export class PlatformWorkspaceService {
  private readonly documentState = signal<PlatformDslDocument>(DEFAULT_DOCUMENT);
  private readonly selectedEpicState = signal<string | null>(DEFAULT_DOCUMENT.backlog.epics[0]?.id ?? null);
  private readonly selectedStoryState = signal<string | null>(DEFAULT_DOCUMENT.backlog.userStories[0]?.id ?? null);
  private readonly selectedNodeState = signal<string | null>(DEFAULT_DOCUMENT.workflowModel.semanticNodes[0]?.id ?? null);

  readonly document = computed(() => this.documentState());
  readonly project = computed(() => this.documentState().project);
  readonly initiative = computed(() => this.documentState().initiative);
  readonly businessContext = computed(() => this.documentState().businessContext);
  readonly epics = computed(() => this.documentState().backlog.epics);
  readonly userStories = computed(() => this.documentState().backlog.userStories);
  readonly businessRules = computed(() => this.documentState().backlog.businessRules);
  readonly workflowModel = computed(() => this.documentState().workflowModel);
  readonly selectedEpicId = computed(() => this.selectedEpicState());
  readonly selectedStoryId = computed(() => this.selectedStoryState());
  readonly selectedNodeId = computed(() => this.selectedNodeState());
  readonly selectedStory = computed(() =>
    this.documentState().backlog.userStories.find((story) => story.id === this.selectedStoryState()) ?? null
  );
  readonly selectedNode = computed(() =>
    this.documentState().workflowModel.semanticNodes.find((node) => node.id === this.selectedNodeState()) ?? null
  );
  readonly selectedNodeVisual = computed(() =>
    this.documentState().workflowModel.visualNodes.find((node) => node.nodeId === this.selectedNodeState()) ?? null
  );
  readonly selectedEpicStories = computed(() =>
    this.documentState().backlog.userStories.filter((story) => story.epicId === this.selectedEpicState())
  );
  readonly traces = computed(() => this.documentState().traceability.relationships);
  readonly dslText = computed(() => this.dslService.serialize(this.documentState()));
  readonly validationReport = computed<ValidationReport>(() => this.validationService.validate(this.documentState()));
  readonly validationSummary = computed(() => ({
    structural: this.validationReport().byCategory.structural.length,
    semantic: this.validationReport().byCategory.semantic.length,
    traceability: this.validationReport().byCategory.traceability.length,
    completeness: this.validationReport().byCategory['requirement-completeness'].length
  }));
  readonly palette = computed<NodeTemplate[]>(() => [
    { type: 'startEvent', label: 'Start', description: 'Workflow entry node', accent: '#5cc8ff' },
    { type: 'processStep', label: 'Process Step', description: 'Business activity or analyst step', accent: '#6de37d' },
    { type: 'decisionGateway', label: 'Decision', description: 'Branching logic and policies', accent: '#ffc44d' },
    { type: 'systemInteraction', label: 'System Interaction', description: 'External or internal system action', accent: '#c693ff' },
    { type: 'endEvent', label: 'End', description: 'Workflow completion node', accent: '#ff8d6c' }
  ]);

  constructor(
    private readonly dslService: PlatformDslService,
    private readonly validationService: PlatformValidationService
  ) {}

  reloadFromDsl(): void {
    this.documentState.set(this.dslService.parse(this.dslText()));
  }

  selectEpic(epicId: string): void {
    this.selectedEpicState.set(epicId);
    this.selectedStoryState.set(this.documentState().backlog.userStories.find((story) => story.epicId === epicId)?.id ?? null);
  }

  selectStory(storyId: string): void {
    this.selectedStoryState.set(storyId);
  }

  selectNode(nodeId: string): void {
    this.selectedNodeState.set(nodeId);
  }

  updateInitiative(patch: Partial<InitiativeRecord>): void {
    this.patchDocument((document) => ({ ...document, initiative: { ...document.initiative, ...patch } }));
  }

  updateBusinessContext(patch: Partial<BusinessContextRecord>): void {
    this.patchDocument((document) => ({
      ...document,
      businessContext: {
        ...document.businessContext,
        ...patch
      }
    }));
  }

  addEpic(): void {
    const nextIndex = this.documentState().backlog.epics.length + 1;
    const epic: EpicRecord = {
      ...baseElement(`epic-${Date.now()}`, 'epic', `New Epic ${nextIndex}`, 'Describe the business capability.'),
      initiativeId: this.documentState().initiative.id,
      key: `EPC-${String(nextIndex).padStart(3, '0')}`,
      outcome: 'Describe the measurable outcome.',
      priority: 'medium'
    };

    this.patchDocument((document) => ({
      ...document,
      backlog: { ...document.backlog, epics: [...document.backlog.epics, epic] },
      traceability: {
        ...document.traceability,
        relationships: [
          ...document.traceability.relationships,
          thisTrace(`trace-${Date.now()}`, 'initiative_to_epic', document.initiative.id, epic.id, 'Epic added under initiative.')
        ]
      }
    }));
    this.selectedEpicState.set(epic.id);
  }

  addStory(epicId: string): void {
    const nextIndex = this.documentState().backlog.userStories.length + 1;
    const storyId = `story-${Date.now()}`;
    const criterion: AcceptanceCriterionRecord = {
      ...baseElement(`ac-${Date.now()}`, 'acceptanceCriterion', 'Acceptance Criterion', 'Define fit criterion.'),
      userStoryId: storyId,
      fitCriterion: 'Define measurable fit criterion.'
    };
    const story: UserStoryRecord = {
      ...baseElement(storyId, 'userStory', `New Story ${nextIndex}`, 'Formalize this requirement in the DSL.'),
      initiativeId: this.documentState().initiative.id,
      epicId,
      key: `USR-${String(nextIndex).padStart(3, '0')}`,
      narrative: 'As a business analyst I need this capability formalized in the DSL.',
      acceptanceCriteria: [criterion],
      businessRuleIds: [],
      domainEntityIds: []
    };

    this.patchDocument((document) => ({
      ...document,
      backlog: { ...document.backlog, userStories: [...document.backlog.userStories, story] },
      traceability: {
        ...document.traceability,
        relationships: [
          ...document.traceability.relationships,
          thisTrace(`trace-${Date.now()}-epic`, 'epic_to_user_story', epicId, story.id, 'Story added under epic.'),
          thisTrace(`trace-${Date.now()}-ac`, 'user_story_to_acceptance_criterion', story.id, criterion.id, 'Initial acceptance criterion created.')
        ]
      }
    }));
    this.selectedStoryState.set(story.id);
  }

  updateEpic(event: { epicId: string; patch: Partial<EpicRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      backlog: {
        ...document.backlog,
        epics: document.backlog.epics.map((epic) => epic.id === event.epicId ? { ...epic, ...event.patch } : epic)
      }
    }));
  }

  updateStory(event: { storyId: string; patch: Partial<UserStoryRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      backlog: {
        ...document.backlog,
        userStories: document.backlog.userStories.map((story) =>
          story.id === event.storyId ? { ...story, ...event.patch } : story
        )
      }
    }));
  }

  addNodeFromTemplate(type: WorkflowNodeType, position: { x: number; y: number }): void {
    const selectedStory = this.selectedStory();
    const nodeId = `node-${type}-${Date.now()}`;
    const node: WorkflowNodeSemanticRecord = {
      ...baseElement(nodeId, 'workflowNode', this.palette().find((item) => item.type === type)?.label ?? type, 'Describe workflow step semantics.'),
      nodeType: type,
      actorId: this.documentState().businessContext.actors[0]?.id ?? null,
      storyId: selectedStory?.id ?? null,
      businessRuleIds: [],
      capabilityId: null,
      serviceCandidateId: null
    };
    const visual: WorkflowNodeVisualRecord = {
      nodeId,
      position,
      size: {
        width: type === 'processStep' || type === 'systemInteraction' ? 220 : 170,
        height: type === 'decisionGateway' ? 110 : 84
      }
    };

    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticNodes: [...document.workflowModel.semanticNodes, node],
        visualNodes: [...document.workflowModel.visualNodes, visual]
      },
      traceability: selectedStory
        ? {
            ...document.traceability,
            relationships: [
              ...document.traceability.relationships,
              thisTrace(`trace-${Date.now()}-story-node`, 'user_story_to_workflow_step', selectedStory.id, node.id, 'Workflow node added from story context.')
            ]
          }
        : document.traceability
    }));
    this.selectedNodeState.set(node.id);
  }

  moveNode(event: { nodeId: string; position: { x: number; y: number } }): void {
    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        visualNodes: document.workflowModel.visualNodes.map((node) =>
          node.nodeId === event.nodeId ? { ...node, position: event.position } : node
        )
      }
    }));
  }

  updateNode(event: {
    nodeId: string;
    semanticPatch?: Partial<WorkflowNodeSemanticRecord>;
    visualPatch?: Partial<WorkflowNodeVisualRecord>;
  }): void {
    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticNodes: document.workflowModel.semanticNodes.map((node) =>
          node.id === event.nodeId ? { ...node, ...(event.semanticPatch ?? {}) } : node
        ),
        visualNodes: document.workflowModel.visualNodes.map((node) =>
          node.nodeId === event.nodeId
            ? {
                ...node,
                ...(event.visualPatch ?? {}),
                position: {
                  ...node.position,
                  ...(event.visualPatch?.position ?? {})
                },
                size: {
                  ...node.size,
                  ...(event.visualPatch?.size ?? {})
                }
              }
            : node
        )
      }
    }));
  }

  removeNode(nodeId: string): void {
    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticNodes: document.workflowModel.semanticNodes.filter((node) => node.id !== nodeId),
        visualNodes: document.workflowModel.visualNodes.filter((node) => node.nodeId !== nodeId),
        connections: document.workflowModel.connections.filter(
          (connection) => connection.sourceNodeId !== nodeId && connection.targetNodeId !== nodeId
        )
      },
      traceability: {
        ...document.traceability,
        relationships: document.traceability.relationships.filter((link) => link.sourceId !== nodeId && link.targetId !== nodeId)
      }
    }));
    this.selectedNodeState.set(this.documentState().workflowModel.semanticNodes[0]?.id ?? null);
  }

  connectNodes(event: { sourceNodeId: string; targetNodeId: string }): void {
    if (event.sourceNodeId === event.targetNodeId) {
      return;
    }
    const exists = this.documentState().workflowModel.connections.some(
      (connection) => connection.sourceNodeId === event.sourceNodeId && connection.targetNodeId === event.targetNodeId
    );
    if (exists) {
      return;
    }

    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        connections: [
          ...document.workflowModel.connections,
          thisConnection(`conn-${Date.now()}`, event.sourceNodeId, event.targetNodeId, 'next', 'sequence')
        ]
      }
    }));
  }

  private patchDocument(mutator: (document: PlatformDslDocument) => PlatformDslDocument): void {
    this.documentState.update((document) => {
      const nextDocument = mutator(document);
      return {
        ...nextDocument,
        metadata: {
          ...nextDocument.metadata,
          exportedAt: new Date().toISOString()
        },
        versioning: {
          ...nextDocument.versioning,
          documentVersion: nextDocument.versioning.documentVersion + 1,
          changeInfo: {
            ...nextDocument.versioning.changeInfo,
            changedAt: new Date().toISOString()
          }
        },
        validation: this.toValidationRecord(this.validationService.validate(nextDocument))
      };
    });
  }

  private toValidationRecord(report: ValidationReport): PlatformDslDocument['validation'] {
    return {
      structural: report.byCategory.structural,
      semantic: report.byCategory.semantic,
      traceability: report.byCategory.traceability,
      requirementCompleteness: report.byCategory['requirement-completeness']
    };
  }
}
