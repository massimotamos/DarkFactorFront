# Formal Semantics Draft

## Purpose

This document states the intended meaning of the first canonical AST constructs.
It is not a full mathematical semantics yet, but it establishes deterministic operational meaning.

## Semantic Principle

The canonical AST is the source of truth.
The visual editor is only a projection of that AST.

## Core Denotations

### ApplicationAst

Denotes the complete semantic specification of an application domain to be validated, transformed, and compiled.

### WorkflowAst

Denotes a directed semantic process over declared operations and domain interactions.

### StartInvocation

Denotes the unique entry state of a workflow.

### EndInvocation

Denotes a terminal workflow state with an optional completion meaning.

### FormInvocation

Denotes a user data-capture contract referencing a declared form definition.
It does not denote layout or widget arrangement.

### ValidationInvocation

Denotes evaluation of a declared rule set over the current semantic input state.

### IntegrationInvocation

Denotes invocation of an externally declared integration operation.

### ApprovalInvocation

Denotes a guarded progression step requiring authorization by a declared role and optionally constrained by policy.

### NotificationInvocation

Denotes emission of a declared notification through a selected delivery channel.

### TransitionAst

Denotes an allowed semantic progression from one invocation state to another.

## Operational Interpretation

At runtime, a workflow can be interpreted as:

- current invocation state
- declared transitions
- side-effectful invocations over external systems
- validation and authorization guards

This interpretation must be deterministic with respect to the canonical AST and the runtime input state.

## Non-Goals

The semantics does not define:

- visual layout
- widget geometry
- BPMN notation
- presentation-layer rendering

Those belong to projection concerns, not language meaning.
