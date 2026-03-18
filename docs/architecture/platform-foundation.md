# DarkFactor Business-To-System Foundation

## Refactored module plan

Frontend
- `src/app/core/models/platform.models.ts`: business-first canonical meta-model
- `src/app/core/state/platform-workspace.service.ts`: DSL-first workspace state
- `src/app/core/services/platform-validation.service.ts`: layered validation framework
- `src/app/features/initiative-management`: initiative and business context
- `src/app/features/backlog-management`: epics, stories, acceptance criteria, rules
- `src/app/features/domain-model`: actors, domain entities, aggregates, constraints, assumptions, risks
- `src/app/features/capability-design`: capabilities, service candidates, interfaces, events, NFR and architecture/deployment inputs
- `src/app/features/canvas-modeler`: workflow projection editor only
- `src/app/features/property-inspector`: semantic vs visual workflow separation
- `src/app/features/traceability`: typed trace links
- `src/app/features/validation`: validation summary

Backend
- `backend/platform-dsl-core`: canonical Java DSL, validation/migration contracts, semantic registries
- `backend/platform-rest-api`: richer canonical document endpoints
- `backend/platform-persistence`: filesystem/database persistence stubs aligned with canonical snapshots

## Top-level DSL structure

- `metadata`
- `versioning`
- `project`
- `initiative`
- `businessContext`
- `backlog`
- `domainModel`
- `capabilityModel`
- `serviceDesign`
- `workflowModel`
- `nonFunctionalRequirements`
- `constraints`
- `assumptions`
- `risks`
- `architectureInputs`
- `deployableSolutionInputs`
- `traceability`
- `validation`

## Architectural intent

The canonical specification now prioritizes business-to-system semantics in this order:
`Initiative -> Business Context -> Backlog -> Domain Model -> Capability Model -> Service Design -> Workflow -> Architecture Inputs -> Deployable Solution Inputs`

Workflow is intentionally subordinate. It exists to project and edit process semantics that are already anchored in stories, actors, rules, entities, and capabilities.
