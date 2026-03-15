# Semantic Application Composer Metamodel

## Intent

This document defines the first formal metamodel for the Semantic Application Composer.
It is the structural basis for the canonical application language behind the projectional editor.

The visual graph is not the source of truth.
The semantic model is the source of truth.

## Root Concept

```text
ApplicationDefinition
  - name: Identifier
  - version: Version
  - workflows: WorkflowDefinition[*]
  - forms: FormDefinition[*]
  - entities: EntityDefinition[*]
  - integrations: IntegrationDefinition[*]
  - roles: RoleDefinition[*]
  - policies: PolicyDefinition[*]
  - ruleSets: RuleSetDefinition[*]
  - notifications: NotificationDefinition[*]
```

## Workflow Concepts

```text
WorkflowDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - description: String?
  - steps: WorkflowStep[*]
  - transitions: Transition[*]
```

```text
WorkflowStep
  - id: Identifier
  - name: Identifier
  - label: String
  - description: String?
  - kind: WorkflowStepKind
```

Concrete workflow step kinds:

- `Start`
- `End`
- `Form`
- `Validation`
- `Integration`
- `Approval`
- `Notification`
- `Task`

Transitions:

```text
Transition
  - id: Identifier
  - sourceStepId: Identifier
  - targetStepId: Identifier
  - label: String?
```

## Supporting Semantic Concepts

### FormDefinition

```text
FormDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - description: String?
  - mode: FormMode
  - dataEntityId: Identifier?
```

### EntityDefinition

```text
EntityDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - attributes: AttributeDefinition[*]
```

### IntegrationDefinition

```text
IntegrationDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - protocol: IntegrationProtocol
  - endpoint: String
  - method: String?
```

### RuleSetDefinition

```text
RuleSetDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - ruleNames: String[*]
```

### RoleDefinition

```text
RoleDefinition
  - id: Identifier
  - name: Identifier
  - label: String
```

### PolicyDefinition

```text
PolicyDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - expression: String
```

### NotificationDefinition

```text
NotificationDefinition
  - id: Identifier
  - name: Identifier
  - label: String
  - channel: NotificationChannel
```

## Static Structural Rules

- Every application must define at least one workflow.
- Every workflow must have exactly one `Start` step.
- Every workflow must have at least one `End` step.
- Every transition source and target must refer to an existing step in the same workflow.
- Every non-terminal step in a linear flow must have an outgoing transition.
- `Form` steps must reference a `FormDefinition`.
- `Validation` steps must reference a `RuleSetDefinition`.
- `Integration` steps must reference an `IntegrationDefinition`.
- `Approval` steps must reference a `RoleDefinition`.
- `Notification` steps must reference a `NotificationDefinition`.

## Current Projection Mapping

The current Angular editor graph is a temporary projection source.

The mapping strategy is:

- canvas node `start` -> `Start` step
- canvas node `form` -> `Form` step + `FormDefinition`
- canvas node `validation` -> `Validation` step + `RuleSetDefinition`
- canvas node `restCall` -> `Integration` step + `IntegrationDefinition`
- canvas node `approval` -> `Approval` step + `RoleDefinition`
- canvas node `notification` -> `Notification` step + `NotificationDefinition`
- canvas node `end` -> `End` step

This metamodel is intentionally compact.
It is sufficient to move the editor from graph-first toward semantic-model-first architecture.
