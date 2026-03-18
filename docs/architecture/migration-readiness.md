# Migration Readiness

Current schema version: `3.0.0`

Migration-ready structures now include:
- `versioning.documentVersion`
- `versioning.createdAt`
- `versioning.updatedAt`
- `versioning.migrationState`
- `versioning.changeSummary`
- backend `DocumentUpgradeStrategy`

Planned upgrade flow from older documents:
1. Normalize older `graph`-centric documents into `backlog`, `domainModel`, `capabilityModel`, and `serviceDesign`.
2. Split workflow semantics from visual layout.
3. Promote text-only references into typed trace links.
4. Mark partially normalized documents as `requires-upgrade`.

Not implemented yet:
- Automatic migrators
- Version-to-version transformers
- Backward-compatibility runtime loaders beyond schema version checks
