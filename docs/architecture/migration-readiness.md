# Migration Readiness

## Current Schema State

- Current schema version: `4.1.0`
- Current migration state values:
  - `native`
  - `requires-upgrade`
  - `upgrade-in-progress`

## Versioning Fields

- `metadata.schemaVersion`
- `versioning.documentVersion`
- `versioning.createdAt`
- `versioning.updatedAt`
- `versioning.migrationState`
- `versioning.targetSchemaVersion`
- `versioning.changeSummary`

## Migration Hook Readiness

The document model is now prepared for future migration tooling because:

- the top-level section boundaries are stable
- semantic layers are explicit
- derivation records and trace links already capture governance state
- visual workflow data is isolated from execution semantics

Migration logic is still a placeholder. The platform can detect unsupported schema versions, but it does not yet transform older documents automatically.
