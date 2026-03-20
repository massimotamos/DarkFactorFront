# Derivation Model

## First-Class Structures

- `derivationRules`
  - defines allowed source layer, target layer, source types, target types, derivation method, and whether analyst approval is required
- `derivationRecords`
  - records actual inferred or analyst-authored transformations for one document version

## Supported Derivation Method Semantics

- `deterministic`
- `rule-based-inferred`
- `ai-heuristic-inferred`
- `analyst-defined`
- `analyst-approved`

## Governance Fields

Each `derivationRecord` captures:

- `derivationStatus`
- `analystApprovalRequired`
- `analystApprovalStatus`
- `confidence`
- `validationStatus`
- `rationale`
- `supersedes`
- `supersededBy`

## Current Examples

- initiative -> epic
- user story -> capability
- capability -> service candidate

## Scope Boundary

The platform does not execute derivation logic yet. It now provides the canonical places where future deterministic rules and AI-assisted inference outputs will be stored, reviewed, and approved.
