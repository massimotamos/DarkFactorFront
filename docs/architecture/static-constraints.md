# Static Constraints

## Purpose

These rules define when a semantic model is well formed.
They apply to the canonical AST, not to the visual graph directly.

## Application-Level Constraints

- An application must have a non-empty name.
- Application declaration names must be unique within their declaration category.
- Workflow names must be unique.
- Form names must be unique.
- Integration names must be unique.
- Role names must be unique.
- Notification names must be unique.

## Workflow Constraints

- A workflow must contain exactly one `StartInvocation`.
- A workflow must contain at least one `EndInvocation`.
- Every invocation id in a workflow must be unique.
- Every transition source must refer to an invocation in the same workflow.
- Every transition target must refer to an invocation in the same workflow.
- Every invocation except `EndInvocation` must have at least one outgoing transition.
- `StartInvocation` must not be a transition target.
- `EndInvocation` should not have outgoing transitions.

## Reference Constraints

- `FormInvocation.formRef` must reference an existing form declaration.
- `ValidationInvocation.ruleSetRef` must reference an existing rule set declaration.
- `IntegrationInvocation.integrationRef` must reference an existing integration declaration.
- `ApprovalInvocation.roleRef` must reference an existing role declaration.
- `NotificationInvocation.notificationRef` must reference an existing notification declaration.

## Minimal Semantic Completeness Constraints

- Every invocation must have a non-empty `name`.
- Every invocation must have a non-empty `label`.
- Integration declarations must define a protocol and endpoint.
- Rule set declarations must contain at least one rule name.
- Notification declarations must define a delivery channel.

## Current Scope

These are compile-time structural and static semantic constraints only.

They do not yet include:

- full reachability analysis
- dead path elimination
- advanced type checking
- effect compatibility
- dataflow soundness
