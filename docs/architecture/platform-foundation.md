# DarkFactor Canonical DSL Upgrade

## Refactored file plan

Frontend
- `src/app/core/models/platform.models.ts`: canonical semantic meta-model, traceability links, validation categories, versioning, and visual projection separation.
- `src/app/core/state/platform-workspace.service.ts`: DSL-first workspace state, default canonical sample, trace-link maintenance hooks, and migration-aware document version updates.
- `src/app/core/services/platform-validation.service.ts`: structural, semantic, traceability, and requirement completeness validation framework.
- `src/app/features/initiative-management/components/initiative-panel`: richer initiative and business context editing.
- `src/app/features/backlog-management/components/backlog-panel`: epics, user stories, acceptance criteria counts, business rule linkage visibility.
- `src/app/features/canvas-modeler/components/workflow-canvas`: semantic node model separated from visual node layout.
- `src/app/features/property-inspector/components/property-inspector`: semantic references edited independently from visual coordinates and sizes.
- `src/app/features/traceability/components/traceability-panel`: traceability inspector skeleton.
- `src/app/features/dsl-visualization/components/dsl-panel`: enriched canonical DSL preview.

Backend
- `backend/platform-dsl-core/.../PlatformDslDocument.java`: canonical Java DSL sections.
- `backend/platform-dsl-core/.../SemanticElementType.java`: typed semantic registry root.
- `backend/platform-dsl-core/.../TraceLinkType.java`: first-class machine-readable trace link types.
- `backend/platform-dsl-core/.../DslValidationService.java`: validation service contract.
- `backend/platform-dsl-core/.../DocumentUpgradeStrategy.java`: migration/upgrade extension hook.
- `backend/platform-rest-api/.../ProjectCommandController.java`: richer document, traceability, and validation endpoints.

Formal artifacts
- `docs/dsl/platform-dsl.schema.json`: canonical schema v2.0.0.
- `docs/dsl/platform-dsl.sample.json`: canonical sample DSL.

## Canonical sections

The DSL is now divided into:
- `metadata`
- `versioning`
- `project`
- `initiative`
- `businessContext`
- `backlog`
- `workflowModel`
- `domainModel`
- `capabilityModel`
- `serviceDesign`
- `nonFunctionalRequirements`
- `traceability`
- `validation`

## Semantic model

Stable semantic elements now exist for:
- `Actor`
- `Constraint`
- `Assumption`
- `Risk`
- `Epic`
- `UserStory`
- `AcceptanceCriterion`
- `BusinessRule`
- `WorkflowNode`
- `DomainEntity`
- `Capability`
- `ServiceCandidate`
- `NFR`
- `ArchitectureConcern`

Every major element carries:
- immutable `id`
- explicit `type`
- `name`
- `description`
- `status`
- `provenance`

## Traceability examples

Examples now represented as first-class links:
- `initiative_to_epic`
- `epic_to_user_story`
- `user_story_to_acceptance_criterion`
- `user_story_to_workflow_step`
- `workflow_step_to_capability`
- `capability_to_service_candidate`
- `user_story_to_domain_entity`
- `user_story_to_business_rule`
- `initiative_to_nfr`
- `nfr_to_architecture_concern`

The trace model is machine-readable and no longer embedded in narrative text.

## Validation model

Initial validator categories:
- `structural`: missing start/end events, missing connection endpoints, disconnected nodes
- `semantic`: missing acceptance criteria, unmapped capabilities
- `traceability`: missing referenced endpoints, missing expected initiative/epic/story trace links
- `requirement-completeness`: missing NFRs, user stories without workflow traces

## Migration-aware approach

Versioning now includes:
- `schemaVersion`
- `documentVersion`
- `baselineVersion`
- `migrationReadiness`
- `changeInfo`

The intended upgrade path from v1 is:
1. map old `metadata/project/initiative/backlog/graph` into the new canonical sections
2. split workflow semantics from visual coordinates
3. promote free-form acceptance criteria into typed records
4. add explicit trace links for inferred relationships
5. mark upgraded documents as `requires-upgrade` until fully normalized

No migration logic is implemented yet; the contracts are now in place for it.

## API adjustments

Endpoints:
- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `GET /api/v1/projects/{projectId}/document`
- `GET /api/v1/projects/{projectId}/traceability`
- `GET /api/v1/projects/{projectId}/validation`
