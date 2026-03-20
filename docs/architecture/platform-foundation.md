# DarkFactor Platform Foundation

## Module Plan

### Frontend
- `core/models/platform.models.ts`: canonical stratified DSL types
- `core/state/platform-workspace.service.ts`: seeded canonical document and mutation logic
- `core/services/platform-validation.service.ts`: structural, semantic, traceability, completeness, and evolution validators
- `features/initiative-management`: intent and business context editing
- `features/backlog-management`: epics, stories, acceptance criteria, and rule summaries
- `features/domain-model`: actors, entities, constraints, assumptions, and risks
- `features/capability-design`: capabilities, services, NFRs, architecture concerns, and deployable targets
- `features/architecture-decision`: architecture decision panel skeleton
- `features/derivation`: derivation and governance panel skeleton
- `features/canvas-modeler`: execution semantics projection and visualization editing
- `features/property-inspector`: semantic workflow meaning vs visual layout separation
- `features/traceability`: first-class machine-readable trace links
- `features/validation`: validation summary surface

### Backend
- `platform-dsl-core`: canonical Java records for the stratified DSL
- `platform-rest-api`: document, validation, and traceability API surface
- `platform-persistence`: filesystem and database persistence adapters

## Canonical Top Level

```json
{
  "metadata": {},
  "semanticLayers": [],
  "derivationModel": {},
  "versioning": {},
  "project": {},
  "intentLayer": {},
  "requirementLayer": {},
  "domainLayer": {},
  "capabilityLayer": {},
  "architectureLayer": {},
  "executionLayer": {},
  "deploymentIntentLayer": {},
  "visualizationLayer": {},
  "traceability": {},
  "validation": {}
}
```

## Current Maturity

- The DSL is now explicitly layered and derivation-aware.
- Workflow is downstream of requirements, domain, capability, and architecture.
- Service candidates and architecture decisions carry governance state.
- Generation logic is still intentionally absent; this stage only formalizes compiler inputs.
