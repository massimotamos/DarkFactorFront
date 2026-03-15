# Next Steps

## Current Status

The prototype now supports:

- semantic graph authoring with a focused palette
- `Application Context` as project entry point
- node-level prompt validation into constrained semantic DSL
- project-wide validation
- typed semantic links on the canvas
- DSL preview and DSL-based save/load
- DSL import diagnostics
- `Generate Code` preview from the toolbar

The current code generation step is intentionally narrow:

- it proves the end-to-end pipeline works
- it generates previewable Angular + Spring Boot + Maven skeleton files
- it is still mostly node-type-driven, not yet deeply relation-aware

## What Was Implemented Most Recently

- renamed `Publish Structure` to `Generate Code`
- added a `Generate Code` modal
- added a first `CodeGenerationService`
- generated preview files include:
  - `pom.xml`
  - Spring Boot role enum
  - Spring Boot entity stubs
  - Spring Boot task service stubs
  - Spring Boot controller stub
  - Angular routes
  - Angular view component stubs
  - Angular generated API service stub

## Recommended Next Step

The next important milestone is:

## Make Code Generation Relation-Aware

Code generation should stop depending only on node categories and start using the semantic links between nodes.

### Target relations to use

- `View -> Task`
  - generate frontend page actions and page/task wiring
- `Task -> Entity`
  - generate backend service intent around domain objects
- `Task -> Integration`
  - generate integration client stubs only when actually used
- `Role -> View`
  - generate route access intent / guard intent
- `Role -> Task`
  - generate backend authorization intent
- `Task -> Rule`
  - generate validation / authorization hooks around task execution

## Practical Implementation Plan

1. Build a semantic generation context from AST nodes + links
2. Refactor `CodeGenerationService` to consume that context
3. Improve generated Angular files:
   - route metadata
   - view-local action placeholders
   - API calls tied to linked tasks
4. Improve generated Spring Boot files:
   - task services referencing linked entities
   - rule hooks in task execution
   - integration client stubs for linked integrations
   - role-aware authorization comments or annotations
5. Keep the current `Generate Code` modal, but make the preview content more semantically accurate

## Not The Next Step Yet

These should come later:

- writing generated files to disk
- zip export
- full project scaffolding generation
- multi-target generation beyond the current Angular + Spring Boot + Maven focus

## Resume Point For Tomorrow

Resume from:

- `src/app/services/code-generation.service.ts`
- `src/app/models/semantic-ast.models.ts`
- semantic links already available through the current AST

Goal for the next session:

Implement relation-aware generation without changing the editor UX.
