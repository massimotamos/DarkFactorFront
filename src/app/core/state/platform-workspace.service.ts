import { computed, Injectable, signal } from '@angular/core';
import {
  AcceptanceCriterionRecord,
  CanonicalElement,
  EpicRecord,
  InitiativeRecord,
  NodeTemplate,
  PlatformDslDocument,
  TraceRelationshipType,
  TraceabilityLinkRecord,
  UserStoryRecord,
  ValidationReport,
  WorkflowConnectionSemanticRecord,
  WorkflowConnectionVisualRecord,
  WorkflowModelRecord,
  WorkflowNodeSemanticRecord,
  WorkflowNodeType,
  WorkflowNodeVisualRecord
} from '../models/platform.models';
import { PlatformDslService } from '../services/platform-dsl.service';
import { PlatformValidationService } from '../services/platform-validation.service';

function now(): string {
  return '2026-03-18T10:00:00Z';
}

function provenance(source: CanonicalElement['provenance']['source'], author: string): CanonicalElement['provenance'] {
  return { source, author, createdAt: now(), updatedAt: now() };
}

function e(
  id: string,
  type: CanonicalElement['type'],
  name: string,
  description: string,
  status: CanonicalElement['status'] = 'draft',
  tags: string[] = [],
  approvalStatus?: CanonicalElement['approvalStatus']
): CanonicalElement {
  return { id, type, name, description, status, provenance: provenance('analyst', 'platform-seed'), tags, approvalStatus };
}

function trace(
  id: string,
  sourceRef: string,
  targetRef: string,
  relationshipType: TraceRelationshipType,
  rationale: string,
  derivationStage: TraceabilityLinkRecord['derivationStage'],
  derivationMethod: TraceabilityLinkRecord['derivationMethod'],
  analystApprovalStatus: TraceabilityLinkRecord['analystApprovalStatus'] = 'approved',
  confidence: TraceabilityLinkRecord['confidence'] = 'high'
): TraceabilityLinkRecord {
  return {
    id,
    sourceRef,
    targetRef,
    relationshipType,
    rationale,
    confidence,
    derivationStage,
    derivationMethod,
    analystApprovalStatus,
    validationStatus: 'validated',
    supersedes: null,
    supersededBy: null
  };
}

function visual(id: string, semanticNodeId: string, x: number, y: number, width: number, height: number, stylePreset: WorkflowNodeVisualRecord['stylePreset']): WorkflowNodeVisualRecord {
  return { ...e(id, 'workflowNodeVisual', `${semanticNodeId} visual`, 'Canvas projection for workflow node.', 'approved', ['visual']), semanticNodeId, position: { x, y }, size: { width, height }, stylePreset };
}

function semanticConnection(id: string, sourceNodeId: string, targetNodeId: string, connectionType: WorkflowConnectionSemanticRecord['connectionType'], conditionExpression: string | null): WorkflowConnectionSemanticRecord {
  return { ...e(id, 'workflowConnectionSemantic', `${sourceNodeId} to ${targetNodeId}`, 'Semantic workflow connection.', 'approved', ['workflow']), sourceNodeId, targetNodeId, connectionType, conditionExpression };
}

function visualConnection(id: string, semanticConnectionId: string, x: number, y: number): WorkflowConnectionVisualRecord {
  return { ...e(id, 'workflowConnectionVisual', `${semanticConnectionId} visual`, 'Canvas projection for workflow connection.', 'approved', ['visual']), semanticConnectionId, labelPosition: { x, y } };
}

const DEFAULT_DOCUMENT: PlatformDslDocument = {
  metadata: {
    schemaId: 'darkfactor.platform.dsl',
    schemaVersion: '4.1.0',
    documentKind: 'business-intent-to-executable-system-specification',
    source: 'angular-workbench'
  },
  semanticLayers: [
    { id: 'intent', name: 'Intent Layer', purpose: 'Business intent, goals, and outcomes.', upstreamDependencies: [], downstreamDerivationTargets: ['requirement', 'architecture'] },
    { id: 'requirement', name: 'Requirement Layer', purpose: 'Epics, stories, criteria, rules, constraints, risks, and NFRs.', upstreamDependencies: ['intent'], downstreamDerivationTargets: ['domain', 'capability', 'execution', 'architecture'] },
    { id: 'domain', name: 'Domain Layer', purpose: 'Actors, entities, aggregate groups, and relationships.', upstreamDependencies: ['requirement'], downstreamDerivationTargets: ['capability', 'architecture', 'execution'] },
    { id: 'capability', name: 'Capability Layer', purpose: 'Business and system capabilities.', upstreamDependencies: ['requirement', 'domain'], downstreamDerivationTargets: ['architecture', 'execution'] },
    { id: 'architecture', name: 'Architecture Layer', purpose: 'Services, interfaces, events, concerns, and decisions.', upstreamDependencies: ['intent', 'requirement', 'domain', 'capability'], downstreamDerivationTargets: ['execution', 'deployment-intent'] },
    { id: 'execution', name: 'Execution Layer', purpose: 'Semantic process and execution responsibility only.', upstreamDependencies: ['requirement', 'domain', 'capability', 'architecture'], downstreamDerivationTargets: ['visualization', 'deployment-intent'] },
    { id: 'deployment-intent', name: 'Deployment Intent Layer', purpose: 'Deployable solution inputs and runtime expectations.', upstreamDependencies: ['architecture', 'execution'], downstreamDerivationTargets: [] },
    { id: 'visualization', name: 'Visualization Layer', purpose: 'Canvas coordinates and styles only.', upstreamDependencies: ['execution'], downstreamDerivationTargets: [] }
  ],
  derivationModel: {
    derivationRules: [
      { id: 'rule-init-epic', name: 'Initiative To Epic', sourceLayer: 'intent', targetLayer: 'requirement', sourceTypes: ['initiative'], targetTypes: ['epic'], derivationMethod: 'analyst-defined', analystApprovalRequired: false, description: 'Initiative decomposes into epics.' },
      { id: 'rule-story-capability', name: 'Story To Capability', sourceLayer: 'requirement', targetLayer: 'capability', sourceTypes: ['userStory'], targetTypes: ['capability'], derivationMethod: 'rule-based-inferred', analystApprovalRequired: true, description: 'Stories imply capabilities.' },
      { id: 'rule-cap-service', name: 'Capability To Service Candidate', sourceLayer: 'capability', targetLayer: 'architecture', sourceTypes: ['capability'], targetTypes: ['serviceCandidate'], derivationMethod: 'ai-heuristic-inferred', analystApprovalRequired: true, description: 'Capabilities suggest service candidates.' }
    ],
    derivationRecords: [
      { id: 'drv-init-epics', ruleId: 'rule-init-epic', sourceRefs: ['initiative-digital-onboarding'], targetRefs: ['epic-intake', 'epic-risk'], derivationStage: 'intent-to-requirement', derivationStatus: 'approved', derivationMethod: 'analyst-defined', analystApprovalRequired: false, analystApprovalStatus: 'approved', confidence: 'high', rationale: 'Analyst decomposed initiative into epics.', validationStatus: 'validated', supersedes: null, supersededBy: null },
      { id: 'drv-story-capabilities', ruleId: 'rule-story-capability', sourceRefs: ['story-intake-1', 'story-risk-1'], targetRefs: ['capability-capture-intake', 'capability-route-review'], derivationStage: 'requirement-to-capability', derivationStatus: 'reviewed', derivationMethod: 'rule-based-inferred', analystApprovalRequired: true, analystApprovalStatus: 'reviewed', confidence: 'medium', rationale: 'Story responsibilities imply capabilities.', validationStatus: 'validated', supersedes: null, supersededBy: null },
      { id: 'drv-cap-services', ruleId: 'rule-cap-service', sourceRefs: ['capability-capture-intake', 'capability-route-review'], targetRefs: ['service-intake-orchestrator', 'service-review-routing'], derivationStage: 'capability-to-architecture', derivationStatus: 'proposed', derivationMethod: 'ai-heuristic-inferred', analystApprovalRequired: true, analystApprovalStatus: 'reviewed', confidence: 'medium', rationale: 'Capabilities propose service boundaries.', validationStatus: 'unvalidated', supersedes: null, supersededBy: null }
    ]
  },
  versioning: {
    documentVersion: 1,
    createdAt: now(),
    updatedAt: now(),
    migrationState: 'native',
    targetSchemaVersion: null,
    changeSummary: 'Introduced explicit semantic stratification, derivation, and governance semantics.'
  },
  project: { ...e('project-customer-onboarding', 'project', 'Customer Onboarding Platform', 'Compiler foundation for onboarding solutions.', 'approved', ['platform']), slug: 'customer-onboarding-platform' },
  intentLayer: {
    initiative: { ...e('initiative-digital-onboarding', 'initiative', 'Digital Customer Onboarding', 'Transform onboarding into a generation-ready specification.', 'approved', ['initiative']), key: 'INIT-001', summary: 'Reduce onboarding lead time and standardize approvals across channels.', vision: 'Turn business requirements into deployable system inputs.', targetOutcomes: ['Reduce lead time', 'Increase auditability', 'Prepare for service derivation'], goalIds: ['goal-lead-time', 'goal-auditability'] },
    goals: [
      { ...e('goal-lead-time', 'goal', 'Reduce onboarding lead time', 'Shorten onboarding turnaround time.', 'approved', ['goal']), metric: 'Reduce turnaround time by 40%.' },
      { ...e('goal-auditability', 'goal', 'Improve auditability', 'Preserve evidence for review decisions.', 'approved', ['goal']), metric: '100% of review decisions linked to traceable evidence.' }
    ],
    businessContext: { id: 'business-context-onboarding', industry: 'Banking', businessDomain: 'Retail Banking Onboarding', problemStatement: 'Onboarding is fragmented across channels and manual handoffs.', businessValue: 'Create a consistent, traceable, automation-ready onboarding model.', stakeholders: ['Business Analyst', 'Operations Lead', 'Compliance Lead'], operatingModel: 'Centralized onboarding operations with manual compliance escalation.', regulatoryContext: ['KYC', 'AML', 'Audit retention policy'], expectedOutcomes: ['Shorter cycle time', 'Higher audit traceability', 'Service derivation readiness'] }
  },
  requirementLayer: {
    backlog: {
      epics: [
        { ...e('epic-intake', 'epic', 'Capture customer intake', 'Model intake and required data capture.', 'approved', ['intake']), initiativeId: 'initiative-digital-onboarding', key: 'EPC-001', businessOutcome: 'Intake is formalized for later UI and API generation.', priority: 'critical' },
        { ...e('epic-risk', 'epic', 'Route risk review', 'Represent conditional compliance review flows.', 'approved', ['risk']), initiativeId: 'initiative-digital-onboarding', key: 'EPC-002', businessOutcome: 'Risk review is explicit and derivation-ready.', priority: 'high' }
      ],
      userStories: [
        { ...e('story-intake-1', 'userStory', 'Collect applicant profile', 'Capture onboarding information as canonical requirements.', 'approved', ['intake']), initiativeId: 'initiative-digital-onboarding', epicId: 'epic-intake', key: 'USR-001', narrative: 'As an applicant I want to submit onboarding details so the bank can assess my request.', businessValue: 'Reduce manual intake handling and standardize required information.', actorIds: ['actor-applicant'], acceptanceCriterionIds: ['ac-intake-required-data'], businessRuleIds: [], domainEntityIds: ['entity-onboarding-application'], capabilityIds: ['capability-capture-intake'], nfrIds: ['nfr-security'], workflowNodeIds: ['node-start', 'node-intake', 'node-end'] },
        { ...e('story-risk-1', 'userStory', 'Escalate high-risk applications', 'Route high-risk applications to compliance review.', 'approved', ['risk']), initiativeId: 'initiative-digital-onboarding', epicId: 'epic-risk', key: 'USR-002', narrative: 'As a compliance analyst I want high-risk applications routed to review so risk is managed explicitly.', businessValue: 'Preserve regulatory compliance and auditability.', actorIds: ['actor-compliance'], acceptanceCriterionIds: ['ac-risk-routed'], businessRuleIds: ['rule-risk-threshold'], domainEntityIds: ['entity-onboarding-application', 'entity-review-case'], capabilityIds: ['capability-route-review'], nfrIds: ['nfr-auditability'], workflowNodeIds: ['node-risk-decision', 'node-review'] }
      ],
      acceptanceCriteria: [
        { ...e('ac-intake-required-data', 'acceptanceCriterion', 'Required intake data captured', 'All mandatory onboarding fields are collected.', 'approved', ['fit']), userStoryId: 'story-intake-1', fitCriterion: 'Identity, address, and product selection are captured.' },
        { ...e('ac-risk-routed', 'acceptanceCriterion', 'High-risk case routed', 'High-risk applications create review work.', 'approved', ['fit']), userStoryId: 'story-risk-1', fitCriterion: 'Risk score above threshold creates a compliance review case.' }
      ],
      businessRules: [{ ...e('rule-risk-threshold', 'businessRule', 'Risk threshold rule', 'A high risk score requires compliance review.', 'approved', ['policy']), ruleExpression: 'if riskScore >= 70 then reviewRequired = true', ruleKind: 'decision' }]
    },
    nonFunctionalRequirements: {
      requirements: [
        { ...e('nfr-auditability', 'nfr', 'End-to-end auditability', 'All onboarding decisions must be auditable.', 'approved', ['nfr']), category: 'auditability', measure: 'Decision and review transitions retained for 7 years.' },
        { ...e('nfr-security', 'nfr', 'Sensitive data protection', 'Sensitive personal data must be protected.', 'approved', ['nfr']), category: 'security', measure: 'Restricted data encrypted at rest and access-controlled.' }
      ]
    },
    constraints: [{ ...e('constraint-audit-retention', 'constraint', 'Audit retention', 'Regulatory retention applies to onboarding decisions.', 'approved', ['constraint']), category: 'regulatory' }],
    assumptions: [{ ...e('assumption-keycloak-later', 'assumption', 'Keycloak planned later', 'Identity integration planning exists but is not yet implemented.', 'draft', ['assumption']), confidence: 'high' }],
    risks: [{ ...e('risk-review-bottleneck', 'risk', 'Manual review bottleneck', 'Compliance review can become a throughput bottleneck.', 'draft', ['risk']), impact: 'high', mitigation: 'Model review routing as an explicit asynchronous service candidate.' }]
  },
  domainLayer: {
    actors: [
      { ...e('actor-applicant', 'actor', 'Applicant', 'Customer applying for onboarding.', 'approved', ['customer']), actorKind: 'human', responsibilities: ['Provide onboarding details', 'Respond to verification requests'] },
      { ...e('actor-compliance', 'actor', 'Compliance Analyst', 'Manual reviewer for escalated applications.', 'approved', ['operations']), actorKind: 'human', responsibilities: ['Review high-risk applications', 'Approve or reject escalations'] }
    ],
    domainEntities: [
      { ...e('entity-onboarding-application', 'domainEntity', 'OnboardingApplication', 'Aggregate representing the onboarding case.', 'approved', ['aggregate']), entityKind: 'aggregate', attributes: [{ name: 'applicationId', type: 'UUID', required: true }, { name: 'customerId', type: 'UUID', required: true }, { name: 'riskScore', type: 'Integer', required: true }] },
      { ...e('entity-review-case', 'domainEntity', 'ComplianceReviewCase', 'Aggregate for compliance review work.', 'approved', ['aggregate']), entityKind: 'aggregate', attributes: [{ name: 'caseId', type: 'UUID', required: true }, { name: 'applicationId', type: 'UUID', required: true }, { name: 'status', type: 'String', required: true }] }
    ],
    aggregateGroups: [{ ...e('aggregate-onboarding', 'aggregateGroup', 'Onboarding Aggregate Group', 'Logical grouping for onboarding entities.', 'approved', ['domain']), entityIds: ['entity-onboarding-application', 'entity-review-case'] }],
    domainRelationships: [{ ...e('rel-application-review', 'domainRelationship', 'Application to review case', 'Review case references the onboarding application.', 'approved', ['domain']), sourceEntityId: 'entity-review-case', targetEntityId: 'entity-onboarding-application', relationshipKind: 'reference' }]
  },
  capabilityLayer: {
    capabilities: [
      { ...e('capability-capture-intake', 'capability', 'Capture Intake Data', 'Support structured onboarding intake.', 'approved', ['capability']), capabilityKind: 'business', businessOutcome: 'The onboarding application becomes a canonical business object.' },
      { ...e('capability-route-review', 'capability', 'Route Compliance Review', 'Route high-risk applications to compliance.', 'approved', ['capability']), capabilityKind: 'application', businessOutcome: 'Compliance review orchestration becomes explicit.' }
    ],
    capabilityGroups: [{ ...e('cap-group-onboarding', 'capabilityGroup', 'Onboarding Capability Group', 'Grouping for intake and review capabilities.', 'approved', ['capability']), capabilityIds: ['capability-capture-intake', 'capability-route-review'] }]
  },
  architectureLayer: {
    serviceDesign: {
      serviceCandidates: [
        { ...e('service-intake-orchestrator', 'serviceCandidate', 'Intake Orchestrator', 'Candidate service owning intake orchestration.', 'draft', ['service'], 'reviewed'), boundedDomainName: 'onboarding-intake', responsibilityStatement: 'Manage customer onboarding intake and initial validation.', ownedEntityIds: ['entity-onboarding-application'], supportedCapabilityIds: ['capability-capture-intake'], inboundInterfaceIds: ['interface-submit-application'], outboundEventIds: ['event-application-submitted'], dependencyIds: ['service-review-routing'], securitySensitivity: 'high', dataClassification: 'confidential', derivationSource: ['story-intake-1', 'capability-capture-intake'], derivationMethod: 'ai-heuristic-inferred', confidence: 'medium', candidateType: 'orchestration-service' },
        { ...e('service-review-routing', 'serviceCandidate', 'Review Routing Service', 'Candidate service for review routing.', 'draft', ['service'], 'reviewed'), boundedDomainName: 'compliance-review', responsibilityStatement: 'Create and route review cases for high-risk onboarding.', ownedEntityIds: ['entity-review-case'], supportedCapabilityIds: ['capability-route-review'], inboundInterfaceIds: ['interface-request-review'], outboundEventIds: ['event-review-case-created'], dependencyIds: [], securitySensitivity: 'high', dataClassification: 'restricted', derivationSource: ['story-risk-1', 'capability-route-review'], derivationMethod: 'ai-heuristic-inferred', confidence: 'medium', candidateType: 'domain-service' }
      ],
      responsibilities: [{ ...e('resp-intake-ownership', 'serviceResponsibility', 'Own intake lifecycle', 'Intake service owns the onboarding application lifecycle.', 'approved', ['service']), serviceCandidateId: 'service-intake-orchestrator', responsibilityStatement: 'Create and update onboarding applications.' }],
      interfaces: [
        { ...e('interface-submit-application', 'serviceInterface', 'Submit Application API', 'Inbound API for onboarding submission.', 'draft', ['api']), serviceCandidateId: 'service-intake-orchestrator', interfaceKind: 'rest-command', contract: 'POST /applications' },
        { ...e('interface-request-review', 'serviceInterface', 'Request Review API', 'Inbound API for compliance review creation.', 'draft', ['api']), serviceCandidateId: 'service-review-routing', interfaceKind: 'async-command', contract: 'Kafka command: ReviewRequested' }
      ],
      events: [
        { ...e('event-application-submitted', 'serviceEvent', 'Application Submitted', 'Event emitted when onboarding submission completes.', 'draft', ['event']), serviceCandidateId: 'service-intake-orchestrator', eventType: 'domain-event', payloadHint: 'applicationId, customerId, timestamp' },
        { ...e('event-review-case-created', 'serviceEvent', 'Review Case Created', 'Event emitted when review case is created.', 'draft', ['event']), serviceCandidateId: 'service-review-routing', eventType: 'integration-event', payloadHint: 'caseId, applicationId, riskScore' }
      ],
      orchestrationStrategyCandidates: [{ ...e('orch-hybrid-review', 'orchestrationStrategyCandidate', 'Hybrid intake-review strategy', 'Hybrid coordination proposal for onboarding.', 'draft', ['architecture'], 'reviewed'), strategyKind: 'hybrid', linkedServiceIds: ['service-intake-orchestrator', 'service-review-routing'], linkedWorkflowIds: ['node-intake', 'node-risk-decision', 'node-review'] }]
    },
    architectureInputs: {
      concerns: [
        { ...e('concern-auditability', 'architectureConcern', 'Auditability concern', 'Architecture must preserve traceable decision evidence.', 'approved', ['architecture']), concernKind: 'auditability' },
        { ...e('concern-security', 'architectureConcern', 'Security concern', 'Architecture must support identity and sensitive data protection.', 'approved', ['architecture']), concernKind: 'security' }
      ],
      decisions: [
        { ...e('decision-onboarding-strategy', 'architectureDecision', 'Onboarding orchestration strategy', 'Choose the runtime coordination style for onboarding and review.', 'draft', ['architecture'], 'reviewed'), decisionType: 'orchestration-strategy', optionsConsidered: ['orchestration', 'choreography', 'hybrid'], selectedOption: 'hybrid', rationale: 'Explicit intake coordination is needed, but review notifications can remain event-driven.', linkedNfrIds: ['nfr-auditability', 'nfr-security'], linkedServiceIds: ['service-intake-orchestrator', 'service-review-routing'], linkedCapabilityIds: ['capability-capture-intake', 'capability-route-review'], linkedWorkflowNodeIds: ['node-intake', 'node-risk-decision', 'node-review'], derivationMethod: 'analyst-approved', analystApprovalRequired: true, confidence: 'medium' }
      ],
      deploymentConstraints: ['Spring Boot modular monolith initially', 'PostgreSQL required', 'Docker-first packaging'],
      dataStores: ['PostgreSQL', 'Filesystem DSL snapshots']
    }
  },
  executionLayer: {
    id: 'workflow-onboarding',
    name: 'Onboarding Workflow Semantics',
    description: 'Workflow is a downstream semantic projection.',
    semanticNodes: [
      { ...e('node-start', 'workflowNodeSemantic', 'Onboarding Start', 'Start onboarding process.', 'approved', ['workflow']), nodeType: 'startEvent', storyId: 'story-intake-1', actorId: 'actor-applicant', capabilityId: null, entityIds: [], businessRuleIds: [], responsibleServiceCandidateId: null, derivationRecordIds: [] },
      { ...e('node-intake', 'workflowNodeSemantic', 'Capture Intake', 'Collect applicant profile information.', 'approved', ['workflow']), nodeType: 'processStep', storyId: 'story-intake-1', actorId: 'actor-applicant', capabilityId: 'capability-capture-intake', entityIds: ['entity-onboarding-application'], businessRuleIds: [], responsibleServiceCandidateId: 'service-intake-orchestrator', derivationRecordIds: ['drv-story-capabilities', 'drv-cap-services'] },
      { ...e('node-risk-decision', 'workflowNodeSemantic', 'Evaluate Risk', 'Apply risk review policy.', 'approved', ['workflow']), nodeType: 'decisionGateway', storyId: 'story-risk-1', actorId: 'actor-compliance', capabilityId: 'capability-route-review', entityIds: ['entity-onboarding-application', 'entity-review-case'], businessRuleIds: ['rule-risk-threshold'], responsibleServiceCandidateId: 'service-review-routing', derivationRecordIds: ['drv-story-capabilities', 'drv-cap-services'] },
      { ...e('node-review', 'workflowNodeSemantic', 'Create Review Case', 'Create compliance review work.', 'approved', ['workflow']), nodeType: 'systemInteraction', storyId: 'story-risk-1', actorId: 'actor-compliance', capabilityId: 'capability-route-review', entityIds: ['entity-review-case'], businessRuleIds: ['rule-risk-threshold'], responsibleServiceCandidateId: 'service-review-routing', derivationRecordIds: ['drv-cap-services'] },
      { ...e('node-end', 'workflowNodeSemantic', 'Onboarding End', 'Complete onboarding projection.', 'approved', ['workflow']), nodeType: 'endEvent', storyId: 'story-intake-1', actorId: null, capabilityId: null, entityIds: [], businessRuleIds: [], responsibleServiceCandidateId: null, derivationRecordIds: [] }
    ],
    semanticConnections: [
      semanticConnection('conn-start-intake', 'node-start', 'node-intake', 'sequence', null),
      semanticConnection('conn-intake-risk', 'node-intake', 'node-risk-decision', 'sequence', null),
      semanticConnection('conn-risk-review', 'node-risk-decision', 'node-review', 'conditional', 'riskScore >= 70'),
      semanticConnection('conn-review-end', 'node-review', 'node-end', 'integration', null)
    ],
    executionResponsibilities: [
      { ...e('exec-intake', 'executionResponsibility', 'Intake execution responsibility', 'Maps intake step to service candidate.', 'approved', ['execution']), workflowNodeId: 'node-intake', serviceCandidateId: 'service-intake-orchestrator' },
      { ...e('exec-review', 'executionResponsibility', 'Review execution responsibility', 'Maps review step to service candidate.', 'approved', ['execution']), workflowNodeId: 'node-review', serviceCandidateId: 'service-review-routing' }
    ]
  },
  deploymentIntentLayer: {
    targets: [
      { ...e('deploy-spring-boot', 'deploymentInput', 'Spring Boot Service Inputs', 'Inputs for service generation.', 'draft', ['generation']), targetKind: 'spring-boot-service', targetName: 'darkfactor-onboarding-services', configurationHint: 'Use approved service candidates and owned entities as derivation anchors.' },
      { ...e('deploy-angular-ui', 'deploymentInput', 'Angular UI Inputs', 'Inputs for UI generation.', 'draft', ['generation']), targetKind: 'angular-ui', targetName: 'darkfactor-onboarding-ui', configurationHint: 'Use stories, criteria, and actors as screen derivation anchors.' },
      { ...e('deploy-postgres', 'deploymentInput', 'PostgreSQL Schema Inputs', 'Inputs for relational schema generation.', 'draft', ['generation']), targetKind: 'postgres-schema', targetName: 'darkfactor-onboarding-db', configurationHint: 'Use entities, aggregates, and ownership boundaries.' },
      { ...e('deploy-kafka', 'deploymentInput', 'Kafka Topology Inputs', 'Inputs for event design.', 'draft', ['generation']), targetKind: 'kafka-topology', targetName: 'darkfactor-onboarding-topology', configurationHint: 'Use service events and async interfaces.' },
      { ...e('deploy-keycloak', 'deploymentInput', 'Keycloak Planning Inputs', 'Inputs for identity plan generation.', 'draft', ['generation']), targetKind: 'keycloak-plan', targetName: 'darkfactor-onboarding-iam', configurationHint: 'Use actors, security NFRs, and service sensitivity.' },
      { ...e('deploy-k8s', 'deploymentInput', 'Kubernetes Inputs', 'Inputs for deployment topology generation.', 'draft', ['generation']), targetKind: 'kubernetes-manifest', targetName: 'darkfactor-onboarding-cluster', configurationHint: 'Use services, NFRs, and architecture decisions.' }
    ]
  },
  visualizationLayer: {
    visualNodes: [
      visual('node-start-visual', 'node-start', 80, 160, 160, 72, 'start'),
      visual('node-intake-visual', 'node-intake', 300, 145, 220, 96, 'activity'),
      visual('node-risk-decision-visual', 'node-risk-decision', 580, 140, 190, 106, 'decision'),
      visual('node-review-visual', 'node-review', 840, 145, 230, 96, 'integration'),
      visual('node-end-visual', 'node-end', 1120, 160, 160, 72, 'end')
    ],
    visualConnections: [
      visualConnection('connv-start-intake', 'conn-start-intake', 220, 190),
      visualConnection('connv-intake-risk', 'conn-intake-risk', 500, 190),
      visualConnection('connv-risk-review', 'conn-risk-review', 790, 180),
      visualConnection('connv-review-end', 'conn-review-end', 1080, 190)
    ]
  },
  traceability: {
    links: [
      trace('trace-init-epic-intake', 'initiative-digital-onboarding', 'epic-intake', 'initiative_to_epic', 'Initiative decomposes into intake epic.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-init-epic-risk', 'initiative-digital-onboarding', 'epic-risk', 'initiative_to_epic', 'Initiative decomposes into risk epic.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-epic-story-intake', 'epic-intake', 'story-intake-1', 'epic_to_userStory', 'Epic decomposes into intake story.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-epic-story-risk', 'epic-risk', 'story-risk-1', 'epic_to_userStory', 'Epic decomposes into risk story.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-story-ac-intake', 'story-intake-1', 'ac-intake-required-data', 'userStory_to_acceptanceCriterion', 'Story has explicit fit criterion.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-story-ac-risk', 'story-risk-1', 'ac-risk-routed', 'userStory_to_acceptanceCriterion', 'Story has explicit fit criterion.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-story-rule-risk', 'story-risk-1', 'rule-risk-threshold', 'userStory_to_businessRule', 'Story depends on risk policy.', 'requirement-to-domain', 'analyst-defined'),
      trace('trace-story-actor-applicant', 'story-intake-1', 'actor-applicant', 'userStory_to_actor', 'Applicant drives intake story.', 'requirement-to-domain', 'analyst-defined'),
      trace('trace-story-actor-compliance', 'story-risk-1', 'actor-compliance', 'userStory_to_actor', 'Compliance drives review story.', 'requirement-to-domain', 'analyst-defined'),
      trace('trace-story-entity-application', 'story-intake-1', 'entity-onboarding-application', 'userStory_to_domainEntity', 'Story creates onboarding aggregate.', 'requirement-to-domain', 'ai-heuristic-inferred', 'reviewed', 'medium'),
      trace('trace-story-entity-review', 'story-risk-1', 'entity-review-case', 'userStory_to_domainEntity', 'Story creates review aggregate.', 'requirement-to-domain', 'ai-heuristic-inferred', 'reviewed', 'medium'),
      trace('trace-story-cap-intake', 'story-intake-1', 'capability-capture-intake', 'userStory_to_capability', 'Story maps to intake capability.', 'requirement-to-capability', 'rule-based-inferred', 'reviewed', 'medium'),
      trace('trace-story-cap-review', 'story-risk-1', 'capability-route-review', 'userStory_to_capability', 'Story maps to review capability.', 'requirement-to-capability', 'rule-based-inferred', 'reviewed', 'medium'),
      trace('trace-story-nfr-security', 'story-intake-1', 'nfr-security', 'userStory_to_nfr', 'Story processes sensitive data.', 'requirement-to-domain', 'analyst-defined'),
      trace('trace-story-nfr-audit', 'story-risk-1', 'nfr-auditability', 'userStory_to_nfr', 'Story requires review evidence.', 'requirement-to-domain', 'analyst-defined'),
      trace('trace-story-node-intake', 'story-intake-1', 'node-intake', 'userStory_to_workflowStep', 'Workflow step projects intake story.', 'architecture-to-execution', 'analyst-approved'),
      trace('trace-story-node-risk', 'story-risk-1', 'node-risk-decision', 'userStory_to_workflowStep', 'Workflow step projects risk story.', 'architecture-to-execution', 'analyst-approved'),
      trace('trace-node-cap-intake', 'node-intake', 'capability-capture-intake', 'workflowStep_to_capability', 'Step realizes intake capability.', 'architecture-to-execution', 'analyst-approved'),
      trace('trace-node-cap-risk', 'node-risk-decision', 'capability-route-review', 'workflowStep_to_capability', 'Step realizes review capability.', 'architecture-to-execution', 'analyst-approved'),
      trace('trace-cap-service-intake', 'capability-capture-intake', 'service-intake-orchestrator', 'capability_to_serviceCandidate', 'Capability maps to intake service.', 'capability-to-architecture', 'ai-heuristic-inferred', 'reviewed', 'medium'),
      trace('trace-cap-service-review', 'capability-route-review', 'service-review-routing', 'capability_to_serviceCandidate', 'Capability maps to review service.', 'capability-to-architecture', 'ai-heuristic-inferred', 'reviewed', 'medium'),
      trace('trace-context-security', 'business-context-onboarding', 'concern-security', 'businessContext_to_architectureConcern', 'Sensitive onboarding context drives security concern.', 'intent-to-requirement', 'analyst-defined'),
      trace('trace-nfr-service-security', 'nfr-security', 'service-intake-orchestrator', 'nfr_to_serviceCandidate', 'Security affects intake service.', 'capability-to-architecture', 'analyst-defined'),
      trace('trace-nfr-concern-audit', 'nfr-auditability', 'concern-auditability', 'nfr_to_architectureConcern', 'Auditability informs architecture.', 'capability-to-architecture', 'deterministic'),
      trace('trace-node-service-review', 'node-review', 'service-review-routing', 'workflowNode_to_serviceCandidate', 'Review step is executed by review service.', 'architecture-to-execution', 'analyst-approved'),
      trace('trace-service-deploy-spring', 'service-intake-orchestrator', 'deploy-spring-boot', 'serviceCandidate_to_deploymentInput', 'Service candidate contributes to service generation inputs.', 'architecture-to-deployment', 'rule-based-inferred', 'reviewed', 'medium'),
      trace('trace-risk-service-review', 'risk-review-bottleneck', 'service-review-routing', 'risk_to_affectedElement', 'Risk affects review service.', 'capability-to-architecture', 'analyst-defined', 'approved', 'medium')
    ]
  },
  validation: { structural: [], semantic: [], traceability: [], completeness: [], evolution: [] }
};

@Injectable({ providedIn: 'root' })
export class PlatformWorkspaceService {
  private readonly documentState = signal<PlatformDslDocument>(DEFAULT_DOCUMENT);
  private readonly selectedEpicState = signal<string | null>(DEFAULT_DOCUMENT.requirementLayer.backlog.epics[0]?.id ?? null);
  private readonly selectedStoryState = signal<string | null>(DEFAULT_DOCUMENT.requirementLayer.backlog.userStories[0]?.id ?? null);
  private readonly selectedNodeState = signal<string | null>(DEFAULT_DOCUMENT.executionLayer.semanticNodes[0]?.id ?? null);

  readonly document = computed(() => this.documentState());
  readonly project = computed(() => this.documentState().project);
  readonly semanticLayers = computed(() => this.documentState().semanticLayers);
  readonly derivationModel = computed(() => this.documentState().derivationModel);
  readonly initiative = computed(() => this.documentState().intentLayer.initiative);
  readonly businessContext = computed(() => this.documentState().intentLayer.businessContext);
  readonly epics = computed(() => this.documentState().requirementLayer.backlog.epics);
  readonly userStories = computed(() => this.documentState().requirementLayer.backlog.userStories);
  readonly acceptanceCriteria = computed(() => this.documentState().requirementLayer.backlog.acceptanceCriteria);
  readonly businessRules = computed(() => this.documentState().requirementLayer.backlog.businessRules);
  readonly domainModel = computed(() => this.documentState().domainLayer);
  readonly capabilityModel = computed(() => this.documentState().capabilityLayer);
  readonly serviceDesign = computed(() => this.documentState().architectureLayer.serviceDesign);
  readonly architectureInputs = computed(() => this.documentState().architectureLayer.architectureInputs);
  readonly architectureDecisions = computed(() => this.documentState().architectureLayer.architectureInputs.decisions);
  readonly workflowModel = computed<WorkflowModelRecord>(() => ({
    ...this.documentState().executionLayer,
    visualNodes: this.documentState().visualizationLayer.visualNodes,
    visualConnections: this.documentState().visualizationLayer.visualConnections
  }));
  readonly traces = computed(() => this.documentState().traceability.links);
  readonly selectedEpicId = computed(() => this.selectedEpicState());
  readonly selectedStoryId = computed(() => this.selectedStoryState());
  readonly selectedNodeId = computed(() => this.selectedNodeState());
  readonly selectedStory = computed(() => this.documentState().requirementLayer.backlog.userStories.find((story) => story.id === this.selectedStoryState()) ?? null);
  readonly selectedNode = computed(() => this.documentState().executionLayer.semanticNodes.find((node) => node.id === this.selectedNodeState()) ?? null);
  readonly selectedNodeVisual = computed(() => this.documentState().visualizationLayer.visualNodes.find((node) => node.semanticNodeId === this.selectedNodeState()) ?? null);
  readonly selectedEpicStories = computed(() => this.documentState().requirementLayer.backlog.userStories.filter((story) => story.epicId === this.selectedEpicState()));
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
    this.selectedStoryState.set(this.documentState().requirementLayer.backlog.userStories.find((story) => story.epicId === epicId)?.id ?? null);
  }

  selectStory(storyId: string): void {
    this.selectedStoryState.set(storyId);
  }

  selectNode(nodeId: string): void {
    this.selectedNodeState.set(nodeId);
  }

  updateInitiative(patch: Partial<InitiativeRecord>): void {
    this.patchDocument((document) => ({ ...document, intentLayer: { ...document.intentLayer, initiative: { ...document.intentLayer.initiative, ...patch } } }));
  }

  updateBusinessContext(patch: Partial<PlatformDslDocument['intentLayer']['businessContext']>): void {
    this.patchDocument((document) => ({ ...document, intentLayer: { ...document.intentLayer, businessContext: { ...document.intentLayer.businessContext, ...patch } } }));
  }

  addEpic(): void {
    const nextIndex = this.documentState().requirementLayer.backlog.epics.length + 1;
    const epic: EpicRecord = { ...e(`epic-${Date.now()}`, 'epic', `New Epic ${nextIndex}`, 'Describe the business outcome.', 'draft', ['epic']), initiativeId: this.documentState().intentLayer.initiative.id, key: `EPC-${String(nextIndex).padStart(3, '0')}`, businessOutcome: 'Define business outcome.', priority: 'medium' };
    this.patchDocument((document) => ({
      ...document,
      requirementLayer: { ...document.requirementLayer, backlog: { ...document.requirementLayer.backlog, epics: [...document.requirementLayer.backlog.epics, epic] } },
      traceability: { ...document.traceability, links: [...document.traceability.links, trace(`trace-${Date.now()}`, document.intentLayer.initiative.id, epic.id, 'initiative_to_epic', 'Epic added under initiative.', 'intent-to-requirement', 'analyst-defined')] }
    }));
    this.selectedEpicState.set(epic.id);
  }

  addStory(epicId: string): void {
    const nextIndex = this.documentState().requirementLayer.backlog.userStories.length + 1;
    const storyId = `story-${Date.now()}`;
    const criterionId = `ac-${Date.now()}`;
    const story: UserStoryRecord = { ...e(storyId, 'userStory', `New Story ${nextIndex}`, 'Describe the user-facing requirement.', 'draft', ['story']), initiativeId: this.documentState().intentLayer.initiative.id, epicId, key: `USR-${String(nextIndex).padStart(3, '0')}`, narrative: 'As a user I want ... so that ...', businessValue: 'Define business value.', actorIds: [], acceptanceCriterionIds: [criterionId], businessRuleIds: [], domainEntityIds: [], capabilityIds: [], nfrIds: [], workflowNodeIds: [] };
    const criterion: AcceptanceCriterionRecord = { ...e(criterionId, 'acceptanceCriterion', 'Acceptance Criterion', 'Define the fit criterion.', 'draft', ['acceptance']), userStoryId: storyId, fitCriterion: 'Define measurable fit criterion.' };
    this.patchDocument((document) => ({
      ...document,
      requirementLayer: {
        ...document.requirementLayer,
        backlog: {
          ...document.requirementLayer.backlog,
          userStories: [...document.requirementLayer.backlog.userStories, story],
          acceptanceCriteria: [...document.requirementLayer.backlog.acceptanceCriteria, criterion]
        }
      },
      traceability: {
        ...document.traceability,
        links: [
          ...document.traceability.links,
          trace(`trace-${Date.now()}-story`, epicId, story.id, 'epic_to_userStory', 'Story added under epic.', 'intent-to-requirement', 'analyst-defined'),
          trace(`trace-${Date.now()}-criterion`, story.id, criterion.id, 'userStory_to_acceptanceCriterion', 'Criterion created with story.', 'intent-to-requirement', 'analyst-defined')
        ]
      }
    }));
    this.selectedStoryState.set(story.id);
  }

  updateEpic(event: { epicId: string; patch: Partial<EpicRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      requirementLayer: { ...document.requirementLayer, backlog: { ...document.requirementLayer.backlog, epics: document.requirementLayer.backlog.epics.map((epic) => epic.id === event.epicId ? { ...epic, ...event.patch } : epic) } }
    }));
  }

  updateStory(event: { storyId: string; patch: Partial<UserStoryRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      requirementLayer: { ...document.requirementLayer, backlog: { ...document.requirementLayer.backlog, userStories: document.requirementLayer.backlog.userStories.map((story) => story.id === event.storyId ? { ...story, ...event.patch } : story) } }
    }));
  }

  addNodeFromTemplate(type: WorkflowNodeType, position: { x: number; y: number }): void {
    const story = this.selectedStory();
    const nodeId = `node-${type}-${Date.now()}`;
    const node: WorkflowNodeSemanticRecord = { ...e(nodeId, 'workflowNodeSemantic', this.palette().find((item) => item.type === type)?.label ?? type, 'Describe workflow semantics.', 'draft', ['workflow']), nodeType: type, storyId: story?.id ?? null, actorId: story?.actorIds[0] ?? null, capabilityId: story?.capabilityIds[0] ?? null, entityIds: story?.domainEntityIds ?? [], businessRuleIds: story?.businessRuleIds ?? [], responsibleServiceCandidateId: null, derivationRecordIds: [] };
    const view = visual(`${nodeId}-visual`, nodeId, position.x, position.y, type === 'processStep' || type === 'systemInteraction' ? 220 : 170, type === 'decisionGateway' ? 110 : 84, type === 'startEvent' ? 'start' : type === 'endEvent' ? 'end' : type === 'decisionGateway' ? 'decision' : type === 'systemInteraction' ? 'integration' : 'activity');
    this.patchDocument((document) => ({
      ...document,
      executionLayer: { ...document.executionLayer, semanticNodes: [...document.executionLayer.semanticNodes, node] },
      visualizationLayer: { ...document.visualizationLayer, visualNodes: [...document.visualizationLayer.visualNodes, view] },
      requirementLayer: story ? { ...document.requirementLayer, backlog: { ...document.requirementLayer.backlog, userStories: document.requirementLayer.backlog.userStories.map((item) => item.id === story.id ? { ...item, workflowNodeIds: [...item.workflowNodeIds, node.id] } : item) } } : document.requirementLayer,
      traceability: story ? { ...document.traceability, links: [...document.traceability.links, trace(`trace-${Date.now()}-workflow`, story.id, node.id, 'userStory_to_workflowStep', 'Workflow step added from story context.', 'architecture-to-execution', 'analyst-approved')] } : document.traceability
    }));
    this.selectedNodeState.set(node.id);
  }

  moveNode(event: { nodeId: string; position: { x: number; y: number } }): void {
    this.patchDocument((document) => ({ ...document, visualizationLayer: { ...document.visualizationLayer, visualNodes: document.visualizationLayer.visualNodes.map((node) => node.semanticNodeId === event.nodeId ? { ...node, position: event.position } : node) } }));
  }

  updateNode(event: { nodeId: string; semanticPatch?: Partial<WorkflowNodeSemanticRecord>; visualPatch?: Partial<WorkflowNodeVisualRecord> }): void {
    this.patchDocument((document) => ({
      ...document,
      executionLayer: { ...document.executionLayer, semanticNodes: document.executionLayer.semanticNodes.map((node) => node.id === event.nodeId ? { ...node, ...(event.semanticPatch ?? {}) } : node) },
      visualizationLayer: { ...document.visualizationLayer, visualNodes: document.visualizationLayer.visualNodes.map((node) => node.semanticNodeId === event.nodeId ? { ...node, ...(event.visualPatch ?? {}), position: { ...node.position, ...(event.visualPatch?.position ?? {}) }, size: { ...node.size, ...(event.visualPatch?.size ?? {}) } } : node) }
    }));
  }

  removeNode(nodeId: string): void {
    this.patchDocument((document) => {
      const remainingConnections = document.executionLayer.semanticConnections.filter((conn) => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId);
      const remainingConnectionIds = new Set(remainingConnections.map((conn) => conn.id));
      return {
        ...document,
        executionLayer: { ...document.executionLayer, semanticNodes: document.executionLayer.semanticNodes.filter((node) => node.id !== nodeId), semanticConnections: remainingConnections, executionResponsibilities: document.executionLayer.executionResponsibilities.filter((item) => item.workflowNodeId !== nodeId) },
        visualizationLayer: { ...document.visualizationLayer, visualNodes: document.visualizationLayer.visualNodes.filter((node) => node.semanticNodeId !== nodeId), visualConnections: document.visualizationLayer.visualConnections.filter((item) => remainingConnectionIds.has(item.semanticConnectionId)) },
        requirementLayer: { ...document.requirementLayer, backlog: { ...document.requirementLayer.backlog, userStories: document.requirementLayer.backlog.userStories.map((story) => ({ ...story, workflowNodeIds: story.workflowNodeIds.filter((id) => id !== nodeId) })) } },
        traceability: { ...document.traceability, links: document.traceability.links.filter((item) => item.sourceRef !== nodeId && item.targetRef !== nodeId) }
      };
    });
  }

  connectNodes(event: { sourceNodeId: string; targetNodeId: string }): void {
    if (event.sourceNodeId === event.targetNodeId) {
      return;
    }
    const semanticId = `conn-${Date.now()}`;
    this.patchDocument((document) => ({
      ...document,
      executionLayer: { ...document.executionLayer, semanticConnections: [...document.executionLayer.semanticConnections, semanticConnection(semanticId, event.sourceNodeId, event.targetNodeId, 'sequence', null)] },
      visualizationLayer: { ...document.visualizationLayer, visualConnections: [...document.visualizationLayer.visualConnections, visualConnection(`${semanticId}-visual`, semanticId, 0, 0)] }
    }));
  }

  private patchDocument(mutator: (document: PlatformDslDocument) => PlatformDslDocument): void {
    this.documentState.update((document) => {
      const nextDocument = mutator(document);
      const report = this.validationService.validate(nextDocument);
      return {
        ...nextDocument,
        versioning: { ...nextDocument.versioning, documentVersion: nextDocument.versioning.documentVersion + 1, updatedAt: new Date().toISOString() },
        validation: { structural: report.byCategory.structural, semantic: report.byCategory.semantic, traceability: report.byCategory.traceability, completeness: report.byCategory.completeness, evolution: report.byCategory.evolution }
      };
    });
  }
}
