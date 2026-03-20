# Architecture Decision Model

## Purpose

`architectureDecision` captures governed architecture proposals that affect later generation phases.

## Current Fields

- `decisionType`
- `optionsConsidered`
- `selectedOption`
- `rationale`
- `linkedNfrIds`
- `linkedServiceIds`
- `linkedCapabilityIds`
- `linkedWorkflowNodeIds`
- `derivationMethod`
- `analystApprovalRequired`
- `approvalStatus`
- `confidence`

## Decision Types In Scope

- `service-boundary`
- `orchestration-strategy`
- `integration-style`
- `security-architecture`

## Orchestration Strategy Readiness

The current model is ready to represent:

- orchestration
- choreography
- hybrid

The runtime engine is intentionally not implemented. This step only makes the choice explicit, reviewable, and traceable to NFRs, services, capabilities, and execution semantics.
