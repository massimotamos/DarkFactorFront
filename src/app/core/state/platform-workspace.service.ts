import { computed, Injectable, signal } from '@angular/core';
import {
  AcceptanceCriterionRecord,
  ArchitectureConcernRecord,
  AssumptionRecord,
  ActorRecord,
  CanonicalElement,
  ConstraintRecord,
  DeployableSolutionInputRecord,
  DomainEntityRecord,
  EpicRecord,
  InitiativeRecord,
  NodeTemplate,
  PlatformDslDocument,
  ServiceCandidateRecord,
  ServiceEventRecord,
  ServiceInterfaceRecord,
  ServiceResponsibilityRecord,
  TraceRelationshipType,
  TraceabilityLinkRecord,
  UserStoryRecord,
  ValidationReport,
  WorkflowConnectionSemanticRecord,
  WorkflowConnectionVisualRecord,
  WorkflowNodeType,
  WorkflowNodeSemanticRecord,
  WorkflowNodeVisualRecord,
  RiskRecord,
  NfrRecord,
  CapabilityRecord
} from '../models/platform.models';
import { PlatformDslService } from '../services/platform-dsl.service';
import { PlatformValidationService } from '../services/platform-validation.service';

function now(): string {
  return '2026-03-18T10:00:00Z';
}

function provenance(source: CanonicalElement['provenance']['source'], author: string): CanonicalElement['provenance'] {
  return { source, author, createdAt: now(), updatedAt: now() };
}

function element(
  id: string,
  type: CanonicalElement['type'],
  name: string,
  description: string,
  status: CanonicalElement['status'] = 'draft',
  tags: string[] = []
): CanonicalElement {
  return { id, type, name, description, status, provenance: provenance('analyst', 'platform-seed'), tags };
}

function link(
  id: string,
  sourceRef: string,
  targetRef: string,
  relationshipType: TraceRelationshipType,
  rationale: string,
  confidence: TraceabilityLinkRecord['confidence'] = 'high'
): TraceabilityLinkRecord {
  return { id, sourceRef, targetRef, relationshipType, rationale, confidence };
}

const ACTOR_APPLICANT: ActorRecord = {
  ...element('actor-applicant', 'actor', 'Applicant', 'Customer applying for onboarding.', 'approved', ['customer']),
  actorKind: 'human',
  responsibilities: ['Provide onboarding details', 'Respond to verification requests']
};

const ACTOR_COMPLIANCE: ActorRecord = {
  ...element('actor-compliance', 'actor', 'Compliance Analyst', 'Manual reviewer for escalated applications.', 'approved', ['operations']),
  actorKind: 'human',
  responsibilities: ['Review high-risk applications', 'Approve or reject escalations']
};

const STORY_INTAKE: UserStoryRecord = {
  ...element('story-intake-1', 'userStory', 'Collect applicant profile', 'Capture onboarding information as canonical requirements.', 'approved', ['intake']),
  initiativeId: 'initiative-digital-onboarding',
  epicId: 'epic-intake',
  key: 'USR-001',
  narrative: 'As an applicant I want to submit onboarding details so the bank can assess my request.',
  businessValue: 'Reduce manual intake handling and standardize required information.',
  actorIds: ['actor-applicant']
};

const STORY_REVIEW: UserStoryRecord = {
  ...element('story-risk-1', 'userStory', 'Escalate high-risk applications', 'Route high-risk applications to compliance review.', 'approved', ['risk']),
  initiativeId: 'initiative-digital-onboarding',
  epicId: 'epic-risk',
  key: 'USR-002',
  narrative: 'As a compliance analyst I want high-risk applications routed to review so risk is managed explicitly.',
  businessValue: 'Preserve regulatory compliance and auditability.',
  actorIds: ['actor-compliance']
};

const ENTITY_APPLICATION: DomainEntityRecord = {
  ...element('entity-onboarding-application', 'domainEntity', 'OnboardingApplication', 'Aggregate representing the onboarding case.', 'approved', ['aggregate']),
  entityKind: 'aggregate',
  attributes: [
    { name: 'applicationId', type: 'UUID', required: true },
    { name: 'customerId', type: 'UUID', required: true },
    { name: 'riskScore', type: 'Integer', required: true }
  ]
};

const ENTITY_REVIEW: DomainEntityRecord = {
  ...element('entity-review-case', 'domainEntity', 'ComplianceReviewCase', 'Aggregate for compliance review work.', 'approved', ['aggregate']),
  entityKind: 'aggregate',
  attributes: [
    { name: 'caseId', type: 'UUID', required: true },
    { name: 'applicationId', type: 'UUID', required: true },
    { name: 'status', type: 'String', required: true }
  ]
};

function thisVisual(
  id: string,
  semanticNodeId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  stylePreset: WorkflowNodeVisualRecord['stylePreset']
): WorkflowNodeVisualRecord {
  return {
    ...element(id, 'workflowNodeVisual', `${semanticNodeId} visual`, 'Canvas projection for workflow node.', 'approved', ['visual']),
    semanticNodeId,
    position: { x, y },
    size: { width, height },
    stylePreset
  };
}

function thisConnection(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  connectionType: WorkflowConnectionSemanticRecord['connectionType'],
  conditionExpression: string | null
): WorkflowConnectionSemanticRecord {
  return {
    ...element(id, 'workflowConnectionSemantic', `${sourceNodeId} to ${targetNodeId}`, 'Semantic workflow connection.', 'approved', ['workflow']),
    sourceNodeId,
    targetNodeId,
    connectionType,
    conditionExpression
  };
}

function thisConnectionVisual(id: string, semanticConnectionId: string, x: number, y: number): WorkflowConnectionVisualRecord {
  return {
    ...element(id, 'workflowConnectionVisual', `${semanticConnectionId} visual`, 'Canvas projection for workflow connection.', 'approved', ['visual']),
    semanticConnectionId,
    labelPosition: { x, y }
  };
}

const DEFAULT_DOCUMENT: PlatformDslDocument = {
  metadata: {
    schemaId: 'darkfactor.platform.dsl',
    schemaVersion: '3.0.0',
    documentKind: 'business-to-system-canonical-specification',
    source: 'angular-workbench'
  },
  versioning: {
    documentVersion: 3,
    createdAt: now(),
    updatedAt: now(),
    migrationState: 'native',
    changeSummary: 'Rebalanced from workflow-centric semantics to business-to-system canonical structure.'
  },
  project: {
    ...element('project-customer-onboarding', 'project', 'Customer Onboarding Platform', 'Compiler foundation for onboarding solutions.', 'approved', ['platform']),
    slug: 'customer-onboarding-platform'
  } as PlatformDslDocument['project'],
  initiative: {
    ...element('initiative-digital-onboarding', 'initiative', 'Digital Customer Onboarding', 'Transform customer onboarding into a generation-ready specification.', 'approved', ['initiative']),
    key: 'INIT-001',
    summary: 'Reduce onboarding lead time and standardize approvals across channels.',
    vision: 'Turn business requirements into deployable system inputs.',
    targetOutcomes: ['Reduce lead time', 'Increase auditability', 'Prepare for service derivation']
  },
  businessContext: {
    industry: 'Banking',
    businessDomain: 'Retail Banking Onboarding',
    problemStatement: 'Onboarding is fragmented across channels and manual handoffs.',
    businessValue: 'Create a consistent, traceable, automation-ready onboarding model.',
    stakeholders: ['Business Analyst', 'Operations Lead', 'Compliance Lead']
  },
  backlog: {
    epics: [
      {
        ...element('epic-intake', 'epic', 'Capture customer intake', 'Model intake and required data capture.', 'approved', ['intake']),
        initiativeId: 'initiative-digital-onboarding',
        key: 'EPC-001',
        businessOutcome: 'Intake is formalized for later UI and API generation.',
        priority: 'critical'
      },
      {
        ...element('epic-risk', 'epic', 'Route risk review', 'Represent conditional compliance review flows.', 'approved', ['risk']),
        initiativeId: 'initiative-digital-onboarding',
        key: 'EPC-002',
        businessOutcome: 'Risk review is explicit and derivation-ready.',
        priority: 'high'
      }
    ],
    userStories: [STORY_INTAKE, STORY_REVIEW],
    acceptanceCriteria: [
      {
        ...element('ac-intake-required-data', 'acceptanceCriterion', 'Required intake data captured', 'All mandatory onboarding fields are collected.', 'approved', ['fit']),
        userStoryId: 'story-intake-1',
        fitCriterion: 'Identity, address, and product selection are captured.'
      },
      {
        ...element('ac-risk-routed', 'acceptanceCriterion', 'High-risk case routed', 'High-risk applications create review work.', 'approved', ['fit']),
        userStoryId: 'story-risk-1',
        fitCriterion: 'Risk score above threshold creates a compliance review case.'
      }
    ],
    businessRules: [
      {
        ...element('rule-risk-threshold', 'businessRule', 'Risk threshold rule', 'A high risk score requires compliance review.', 'approved', ['policy']),
        ruleExpression: 'if riskScore >= 70 then reviewRequired = true',
        ruleKind: 'decision'
      }
    ]
  },
  domainModel: {
    actors: [ACTOR_APPLICANT, ACTOR_COMPLIANCE],
    domainEntities: [ENTITY_APPLICATION, ENTITY_REVIEW],
    aggregateGroups: [
      {
        ...element('aggregate-onboarding', 'aggregateGroup', 'Onboarding Aggregate Group', 'Logical grouping for onboarding entities.', 'approved', ['domain']),
        entityIds: ['entity-onboarding-application', 'entity-review-case']
      }
    ]
  },
  capabilityModel: {
    capabilities: [
      {
        ...element('capability-capture-intake', 'capability', 'Capture Intake Data', 'Support structured onboarding intake.', 'approved', ['capability']),
        capabilityKind: 'business',
        businessOutcome: 'The onboarding application becomes a canonical business object.'
      },
      {
        ...element('capability-route-review', 'capability', 'Route Compliance Review', 'Route high-risk applications to compliance.', 'approved', ['capability']),
        capabilityKind: 'application',
        businessOutcome: 'Compliance review orchestration becomes explicit.'
      }
    ]
  },
  serviceDesign: {
    serviceCandidates: [
      {
        ...element('service-intake-orchestrator', 'serviceCandidate', 'Intake Orchestrator', 'Candidate service owning intake orchestration.', 'draft', ['service']),
        boundedDomainName: 'onboarding-intake',
        responsibilityStatement: 'Manage customer onboarding intake and initial validation.',
        ownedEntityIds: ['entity-onboarding-application'],
        supportedCapabilityIds: ['capability-capture-intake'],
        inboundInterfaceIds: ['interface-submit-application'],
        outboundEventIds: ['event-application-submitted'],
        dependencyIds: ['service-review-routing'],
        securitySensitivity: 'high',
        dataClassification: 'confidential'
      },
      {
        ...element('service-review-routing', 'serviceCandidate', 'Review Routing Service', 'Candidate service for review routing.', 'draft', ['service']),
        boundedDomainName: 'compliance-review',
        responsibilityStatement: 'Create and route review cases for high-risk onboarding.',
        ownedEntityIds: ['entity-review-case'],
        supportedCapabilityIds: ['capability-route-review'],
        inboundInterfaceIds: ['interface-request-review'],
        outboundEventIds: ['event-review-case-created'],
        dependencyIds: [],
        securitySensitivity: 'high',
        dataClassification: 'restricted'
      }
    ],
    responsibilities: [
      {
        ...element('resp-intake-ownership', 'serviceResponsibility', 'Own intake lifecycle', 'Intake service owns the onboarding application lifecycle.', 'approved', ['service']),
        serviceCandidateId: 'service-intake-orchestrator',
        responsibilityStatement: 'Create and update onboarding applications.'
      }
    ],
    interfaces: [
      {
        ...element('interface-submit-application', 'serviceInterface', 'Submit Application API', 'Inbound API for onboarding submission.', 'draft', ['api']),
        serviceCandidateId: 'service-intake-orchestrator',
        interfaceKind: 'rest-command',
        contract: 'POST /applications'
      },
      {
        ...element('interface-request-review', 'serviceInterface', 'Request Review API', 'Inbound API for compliance review creation.', 'draft', ['api']),
        serviceCandidateId: 'service-review-routing',
        interfaceKind: 'async-command',
        contract: 'Kafka command: ReviewRequested'
      }
    ],
    events: [
      {
        ...element('event-application-submitted', 'serviceEvent', 'Application Submitted', 'Event emitted when onboarding submission completes.', 'draft', ['event']),
        serviceCandidateId: 'service-intake-orchestrator',
        eventType: 'domain-event',
        payloadHint: 'applicationId, customerId, timestamp'
      },
      {
        ...element('event-review-case-created', 'serviceEvent', 'Review Case Created', 'Event emitted when review case is created.', 'draft', ['event']),
        serviceCandidateId: 'service-review-routing',
        eventType: 'integration-event',
        payloadHint: 'caseId, applicationId, riskScore'
      }
    ]
  },
  workflowModel: {
    id: 'workflow-onboarding',
    name: 'Onboarding Workflow Projection',
    description: 'Workflow is a projection of stories, actors, rules, and capabilities.',
    semanticNodes: [
      {
        ...element('node-start', 'workflowNodeSemantic', 'Onboarding Start', 'Start onboarding process.', 'approved', ['workflow']),
        nodeType: 'startEvent',
        storyId: 'story-intake-1',
        actorId: 'actor-applicant',
        capabilityId: null,
        entityIds: [],
        businessRuleIds: []
      },
      {
        ...element('node-intake', 'workflowNodeSemantic', 'Capture Intake', 'Collect applicant profile information.', 'approved', ['workflow']),
        nodeType: 'processStep',
        storyId: 'story-intake-1',
        actorId: 'actor-applicant',
        capabilityId: 'capability-capture-intake',
        entityIds: ['entity-onboarding-application'],
        businessRuleIds: []
      },
      {
        ...element('node-risk-decision', 'workflowNodeSemantic', 'Evaluate Risk', 'Apply risk review policy.', 'approved', ['workflow']),
        nodeType: 'decisionGateway',
        storyId: 'story-risk-1',
        actorId: 'actor-compliance',
        capabilityId: 'capability-route-review',
        entityIds: ['entity-onboarding-application', 'entity-review-case'],
        businessRuleIds: ['rule-risk-threshold']
      },
      {
        ...element('node-review', 'workflowNodeSemantic', 'Create Review Case', 'Create compliance review work.', 'approved', ['workflow']),
        nodeType: 'systemInteraction',
        storyId: 'story-risk-1',
        actorId: 'actor-compliance',
        capabilityId: 'capability-route-review',
        entityIds: ['entity-review-case'],
        businessRuleIds: ['rule-risk-threshold']
      },
      {
        ...element('node-end', 'workflowNodeSemantic', 'Onboarding End', 'Complete onboarding projection.', 'approved', ['workflow']),
        nodeType: 'endEvent',
        storyId: 'story-intake-1',
        actorId: null,
        capabilityId: null,
        entityIds: [],
        businessRuleIds: []
      }
    ],
    visualNodes: [
      thisVisual('node-start-visual', 'node-start', 80, 160, 160, 72, 'start'),
      thisVisual('node-intake-visual', 'node-intake', 300, 145, 220, 96, 'activity'),
      thisVisual('node-risk-decision-visual', 'node-risk-decision', 580, 140, 190, 106, 'decision'),
      thisVisual('node-review-visual', 'node-review', 840, 145, 230, 96, 'integration'),
      thisVisual('node-end-visual', 'node-end', 1120, 160, 160, 72, 'end')
    ],
    semanticConnections: [
      thisConnection('conn-start-intake', 'node-start', 'node-intake', 'sequence', null),
      thisConnection('conn-intake-risk', 'node-intake', 'node-risk-decision', 'sequence', null),
      thisConnection('conn-risk-review', 'node-risk-decision', 'node-review', 'conditional', 'riskScore >= 70'),
      thisConnection('conn-review-end', 'node-review', 'node-end', 'integration', null)
    ],
    visualConnections: [
      thisConnectionVisual('connv-start-intake', 'conn-start-intake', 220, 190),
      thisConnectionVisual('connv-intake-risk', 'conn-intake-risk', 500, 190),
      thisConnectionVisual('connv-risk-review', 'conn-risk-review', 790, 180),
      thisConnectionVisual('connv-review-end', 'conn-review-end', 1080, 190)
    ]
  },
  nonFunctionalRequirements: {
    requirements: [
      {
        ...element('nfr-auditability', 'nfr', 'End-to-end auditability', 'All onboarding decisions must be auditable.', 'approved', ['nfr']),
        category: 'auditability',
        measure: 'Decision and review transitions retained for 7 years.'
      },
      {
        ...element('nfr-security', 'nfr', 'Sensitive data protection', 'Sensitive personal data must be protected.', 'approved', ['nfr']),
        category: 'security',
        measure: 'Restricted data encrypted at rest and access-controlled.'
      }
    ]
  },
  constraints: [
    {
      ...element('constraint-audit-retention', 'constraint', 'Audit retention', 'Regulatory retention applies to onboarding decisions.', 'approved', ['constraint']),
      category: 'regulatory'
    }
  ],
  assumptions: [
    {
      ...element('assumption-keycloak-later', 'assumption', 'Keycloak planned later', 'Identity integration planning exists but is not yet implemented.', 'draft', ['assumption']),
      confidence: 'high'
    }
  ],
  risks: [
    {
      ...element('risk-review-bottleneck', 'risk', 'Manual review bottleneck', 'Compliance review can become a throughput bottleneck.', 'draft', ['risk']),
      impact: 'high',
      mitigation: 'Model review routing as an explicit service candidate with asynchronous inputs.'
    }
  ],
  architectureInputs: {
    concerns: [
      {
        ...element('concern-auditability', 'architectureConcern', 'Auditability concern', 'Architecture must preserve traceable decision evidence.', 'approved', ['architecture']),
        concernKind: 'auditability'
      },
      {
        ...element('concern-security', 'architectureConcern', 'Security concern', 'Architecture must support identity and sensitive data protection.', 'approved', ['architecture']),
        concernKind: 'security'
      }
    ],
    deploymentConstraints: ['Spring Boot modular monolith initially', 'PostgreSQL required', 'Docker-first packaging'],
    dataStores: ['PostgreSQL', 'Filesystem DSL snapshots']
  },
  deployableSolutionInputs: {
    targets: [
      {
        ...element('deploy-spring-boot', 'deploymentInput', 'Spring Boot Service Inputs', 'Inputs for service generation.', 'draft', ['generation']),
        targetKind: 'spring-boot-service',
        targetName: 'darkfactor-onboarding-services',
        configurationHint: 'Use service candidates and owned entities as derivation anchors.'
      },
      {
        ...element('deploy-angular-ui', 'deploymentInput', 'Angular UI Inputs', 'Inputs for analyst and runtime UI generation.', 'draft', ['generation']),
        targetKind: 'angular-ui',
        targetName: 'darkfactor-onboarding-ui',
        configurationHint: 'Use user stories, acceptance criteria, and actors as screen derivation anchors.'
      },
      {
        ...element('deploy-postgres', 'deploymentInput', 'PostgreSQL Schema Inputs', 'Inputs for relational schema generation.', 'draft', ['generation']),
        targetKind: 'postgres-schema',
        targetName: 'darkfactor-onboarding-db',
        configurationHint: 'Use domain entities, aggregates, and ownership boundaries.'
      },
      {
        ...element('deploy-kafka', 'deploymentInput', 'Kafka Topology Inputs', 'Inputs for event design.', 'draft', ['generation']),
        targetKind: 'kafka-topology',
        targetName: 'darkfactor-onboarding-topology',
        configurationHint: 'Use service events and async interfaces.'
      },
      {
        ...element('deploy-keycloak', 'deploymentInput', 'Keycloak Planning Inputs', 'Inputs for identity plan generation.', 'draft', ['generation']),
        targetKind: 'keycloak-plan',
        targetName: 'darkfactor-onboarding-iam',
        configurationHint: 'Use actors, security NFRs, and service sensitivity.'
      },
      {
        ...element('deploy-k8s', 'deploymentInput', 'Kubernetes Inputs', 'Inputs for deployment topology generation.', 'draft', ['generation']),
        targetKind: 'kubernetes-manifest',
        targetName: 'darkfactor-onboarding-cluster',
        configurationHint: 'Use service candidates, NFRs, and architecture inputs.'
      }
    ]
  },
  traceability: {
    links: [
      link('trace-init-epic-intake', 'initiative-digital-onboarding', 'epic-intake', 'initiative_to_epic', 'Initiative decomposes into intake epic.'),
      link('trace-init-epic-risk', 'initiative-digital-onboarding', 'epic-risk', 'initiative_to_epic', 'Initiative decomposes into risk epic.'),
      link('trace-epic-story-intake', 'epic-intake', 'story-intake-1', 'epic_to_userStory', 'Epic decomposes into intake story.'),
      link('trace-epic-story-risk', 'epic-risk', 'story-risk-1', 'epic_to_userStory', 'Epic decomposes into risk story.'),
      link('trace-story-ac-intake', 'story-intake-1', 'ac-intake-required-data', 'userStory_to_acceptanceCriterion', 'Story has explicit fit criterion.'),
      link('trace-story-ac-risk', 'story-risk-1', 'ac-risk-routed', 'userStory_to_acceptanceCriterion', 'Story has explicit fit criterion.'),
      link('trace-story-rule-risk', 'story-risk-1', 'rule-risk-threshold', 'userStory_to_businessRule', 'Story depends on risk policy.'),
      link('trace-story-actor-applicant', 'story-intake-1', 'actor-applicant', 'userStory_to_actor', 'Applicant drives intake story.'),
      link('trace-story-actor-compliance', 'story-risk-1', 'actor-compliance', 'userStory_to_actor', 'Compliance drives review story.'),
      link('trace-story-entity-application', 'story-intake-1', 'entity-onboarding-application', 'userStory_to_domainEntity', 'Story creates onboarding aggregate.'),
      link('trace-story-entity-review', 'story-risk-1', 'entity-review-case', 'userStory_to_domainEntity', 'Story creates review aggregate.'),
      link('trace-story-node-intake', 'story-intake-1', 'node-intake', 'userStory_to_workflowStep', 'Workflow step projects intake story.'),
      link('trace-story-node-risk', 'story-risk-1', 'node-risk-decision', 'userStory_to_workflowStep', 'Workflow step projects risk story.'),
      link('trace-node-cap-intake', 'node-intake', 'capability-capture-intake', 'workflowStep_to_capability', 'Step realizes intake capability.'),
      link('trace-node-cap-risk', 'node-risk-decision', 'capability-route-review', 'workflowStep_to_capability', 'Step realizes review capability.'),
      link('trace-cap-service-intake', 'capability-capture-intake', 'service-intake-orchestrator', 'capability_to_serviceCandidate', 'Capability maps to intake service.'),
      link('trace-cap-service-review', 'capability-route-review', 'service-review-routing', 'capability_to_serviceCandidate', 'Capability maps to review service.'),
      link('trace-nfr-service-security', 'nfr-security', 'service-intake-orchestrator', 'nfr_to_serviceCandidate', 'Security affects intake service.'),
      link('trace-nfr-concern-audit', 'nfr-auditability', 'concern-auditability', 'nfr_to_architectureConcern', 'Auditability informs architecture.'),
      link('trace-risk-service-review', 'risk-review-bottleneck', 'service-review-routing', 'risk_to_affectedElement', 'Risk affects review service.', 'medium')
    ]
  },
  validation: {
    structural: [],
    semantic: [],
    traceability: [],
    completeness: [],
    evolution: []
  }
};

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
  readonly acceptanceCriteria = computed(() => this.documentState().backlog.acceptanceCriteria);
  readonly businessRules = computed(() => this.documentState().backlog.businessRules);
  readonly domainModel = computed(() => this.documentState().domainModel);
  readonly capabilityModel = computed(() => this.documentState().capabilityModel);
  readonly serviceDesign = computed(() => this.documentState().serviceDesign);
  readonly workflowModel = computed(() => this.documentState().workflowModel);
  readonly traces = computed(() => this.documentState().traceability.links);
  readonly selectedEpicId = computed(() => this.selectedEpicState());
  readonly selectedStoryId = computed(() => this.selectedStoryState());
  readonly selectedNodeId = computed(() => this.selectedNodeState());
  readonly selectedStory = computed(() => this.documentState().backlog.userStories.find((story) => story.id === this.selectedStoryState()) ?? null);
  readonly selectedNode = computed(() => this.documentState().workflowModel.semanticNodes.find((node) => node.id === this.selectedNodeState()) ?? null);
  readonly selectedNodeVisual = computed(() => this.documentState().workflowModel.visualNodes.find((node) => node.semanticNodeId === this.selectedNodeState()) ?? null);
  readonly selectedEpicStories = computed(() => this.documentState().backlog.userStories.filter((story) => story.epicId === this.selectedEpicState()));
  readonly dslText = computed(() => this.dslService.serialize(this.documentState()));
  readonly validationReport = computed<ValidationReport>(() => this.validationService.validate(this.documentState()));
  readonly palette = computed<NodeTemplate[]>(() => [
    { type: 'startEvent', label: 'Start', description: 'Workflow entry projection', accent: '#5cc8ff' },
    { type: 'processStep', label: 'Process Step', description: 'Business activity projection', accent: '#6de37d' },
    { type: 'decisionGateway', label: 'Decision', description: 'Rule-driven branching projection', accent: '#ffc44d' },
    { type: 'systemInteraction', label: 'System Interaction', description: 'Service or integration projection', accent: '#c693ff' },
    { type: 'endEvent', label: 'End', description: 'Workflow completion projection', accent: '#ff8d6c' }
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

  updateBusinessContext(patch: Partial<PlatformDslDocument['businessContext']>): void {
    this.patchDocument((document) => ({ ...document, businessContext: { ...document.businessContext, ...patch } }));
  }

  addEpic(): void {
    const nextIndex = this.documentState().backlog.epics.length + 1;
    const epic: EpicRecord = {
      ...element(`epic-${Date.now()}`, 'epic', `New Epic ${nextIndex}`, 'Describe the business outcome.', 'draft', ['epic']),
      initiativeId: this.documentState().initiative.id,
      key: `EPC-${String(nextIndex).padStart(3, '0')}`,
      businessOutcome: 'Define business outcome.',
      priority: 'medium'
    };
    this.patchDocument((document) => ({
      ...document,
      backlog: { ...document.backlog, epics: [...document.backlog.epics, epic] },
      traceability: {
        ...document.traceability,
        links: [...document.traceability.links, link(`trace-${Date.now()}`, document.initiative.id, epic.id, 'initiative_to_epic', 'Epic added under initiative.')]
      }
    }));
    this.selectedEpicState.set(epic.id);
  }

  addStory(epicId: string): void {
    const nextIndex = this.documentState().backlog.userStories.length + 1;
    const storyId = `story-${Date.now()}`;
    const criterionId = `ac-${Date.now()}`;
    const story: UserStoryRecord = {
      ...element(storyId, 'userStory', `New Story ${nextIndex}`, 'Describe the user-facing requirement.', 'draft', ['story']),
      initiativeId: this.documentState().initiative.id,
      epicId,
      key: `USR-${String(nextIndex).padStart(3, '0')}`,
      narrative: 'As a user I want ... so that ...',
      businessValue: 'Define business value.',
      actorIds: []
    };
    const criterion: AcceptanceCriterionRecord = {
      ...element(criterionId, 'acceptanceCriterion', 'Acceptance Criterion', 'Define the fit criterion.', 'draft', ['acceptance']),
      userStoryId: storyId,
      fitCriterion: 'Define measurable fit criterion.'
    };
    this.patchDocument((document) => ({
      ...document,
      backlog: {
        ...document.backlog,
        userStories: [...document.backlog.userStories, story],
        acceptanceCriteria: [...document.backlog.acceptanceCriteria, criterion]
      },
      traceability: {
        ...document.traceability,
        links: [
          ...document.traceability.links,
          link(`trace-${Date.now()}-story`, epicId, story.id, 'epic_to_userStory', 'Story added under epic.'),
          link(`trace-${Date.now()}-criterion`, story.id, criterion.id, 'userStory_to_acceptanceCriterion', 'Criterion created with story.')
        ]
      }
    }));
    this.selectedStoryState.set(story.id);
  }

  updateEpic(event: { epicId: string; patch: Partial<EpicRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      backlog: { ...document.backlog, epics: document.backlog.epics.map((epic) => epic.id === event.epicId ? { ...epic, ...event.patch } : epic) }
    }));
  }

  updateStory(event: { storyId: string; patch: Partial<UserStoryRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      backlog: { ...document.backlog, userStories: document.backlog.userStories.map((story) => story.id === event.storyId ? { ...story, ...event.patch } : story) }
    }));
  }

  addNodeFromTemplate(type: WorkflowNodeType, position: { x: number; y: number }): void {
    const story = this.selectedStory();
    const nodeId = `node-${type}-${Date.now()}`;
    const node: WorkflowNodeSemanticRecord = {
      ...element(nodeId, 'workflowNodeSemantic', this.palette().find((item) => item.type === type)?.label ?? type, 'Describe workflow semantics.', 'draft', ['workflow']),
      nodeType: type,
      storyId: story?.id ?? null,
      actorId: story?.actorIds[0] ?? null,
      capabilityId: null,
      entityIds: [],
      businessRuleIds: []
    };
    const visual = thisVisual(
      `${nodeId}-visual`,
      nodeId,
      position.x,
      position.y,
      type === 'processStep' || type === 'systemInteraction' ? 220 : 170,
      type === 'decisionGateway' ? 110 : 84,
      type === 'startEvent' ? 'start' : type === 'endEvent' ? 'end' : type === 'decisionGateway' ? 'decision' : type === 'systemInteraction' ? 'integration' : 'activity'
    );

    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticNodes: [...document.workflowModel.semanticNodes, node],
        visualNodes: [...document.workflowModel.visualNodes, visual]
      },
      traceability: story
        ? {
            ...document.traceability,
            links: [...document.traceability.links, link(`trace-${Date.now()}-workflow`, story.id, node.id, 'userStory_to_workflowStep', 'Workflow step added from story context.')]
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
        visualNodes: document.workflowModel.visualNodes.map((node) => node.semanticNodeId === event.nodeId ? { ...node, position: event.position } : node)
      }
    }));
  }

  updateNode(event: { nodeId: string; semanticPatch?: Partial<WorkflowNodeSemanticRecord>; visualPatch?: Partial<WorkflowNodeVisualRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticNodes: document.workflowModel.semanticNodes.map((node) => node.id === event.nodeId ? { ...node, ...(event.semanticPatch ?? {}) } : node),
        visualNodes: document.workflowModel.visualNodes.map((node) =>
          node.semanticNodeId === event.nodeId
            ? {
                ...node,
                ...(event.visualPatch ?? {}),
                position: { ...node.position, ...(event.visualPatch?.position ?? {}) },
                size: { ...node.size, ...(event.visualPatch?.size ?? {}) }
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
        visualNodes: document.workflowModel.visualNodes.filter((node) => node.semanticNodeId !== nodeId),
        semanticConnections: document.workflowModel.semanticConnections.filter((conn) => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId),
        visualConnections: document.workflowModel.visualConnections.filter((visual) =>
          document.workflowModel.semanticConnections
            .filter((conn) => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId)
            .some((conn) => conn.id === visual.semanticConnectionId)
        )
      },
      traceability: { ...document.traceability, links: document.traceability.links.filter((linkItem) => linkItem.sourceRef !== nodeId && linkItem.targetRef !== nodeId) }
    }));
  }

  connectNodes(event: { sourceNodeId: string; targetNodeId: string }): void {
    if (event.sourceNodeId === event.targetNodeId) {
      return;
    }
    const semanticId = `conn-${Date.now()}`;
    this.patchDocument((document) => ({
      ...document,
      workflowModel: {
        ...document.workflowModel,
        semanticConnections: [...document.workflowModel.semanticConnections, thisConnection(semanticId, event.sourceNodeId, event.targetNodeId, 'sequence', null)],
        visualConnections: [...document.workflowModel.visualConnections, thisConnectionVisual(`${semanticId}-visual`, semanticId, 0, 0)]
      }
    }));
  }

  private patchDocument(mutator: (document: PlatformDslDocument) => PlatformDslDocument): void {
    this.documentState.update((document) => {
      const nextDocument = mutator(document);
      const report = this.validationService.validate(nextDocument);
      return {
        ...nextDocument,
        versioning: {
          ...nextDocument.versioning,
          documentVersion: nextDocument.versioning.documentVersion + 1,
          updatedAt: new Date().toISOString()
        },
        validation: {
          structural: report.byCategory.structural,
          semantic: report.byCategory.semantic,
          traceability: report.byCategory.traceability,
          completeness: report.byCategory.completeness,
          evolution: report.byCategory.evolution
        }
      };
    });
  }
}
