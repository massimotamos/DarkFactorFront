# Semantic Stratification

## Layer Hierarchy

1. `intent`
   - Initiative, goals, business context, expected outcomes
2. `requirement`
   - Epics, user stories, acceptance criteria, business rules, constraints, assumptions, risks, NFRs
3. `domain`
   - Actors, domain entities, aggregate groups, domain relationships
4. `capability`
   - Capabilities and capability groupings
5. `architecture`
   - Service candidates, interfaces, events, architecture concerns, architecture decisions, orchestration strategy candidates
6. `execution`
   - Workflow semantic nodes, semantic connections, execution responsibilities
7. `deployment-intent`
   - Deployable solution inputs and runtime expectations
8. `visualization`
   - Workflow visual nodes, visual connections, canvas-only metadata

## Allowed Transformation Direction

- `intent -> requirement`
- `requirement -> domain`
- `requirement -> capability`
- `intent + requirement + domain + capability -> architecture`
- `requirement + domain + capability + architecture -> execution`
- `architecture + execution -> deployment-intent`
- `execution -> visualization`

## Prohibited Shortcuts

- `visualization -> architecture`
- `visualization -> requirement`
- `workflow canvas coordinates -> semantic derivation`
- `service candidate -> initiative`

## Future Generator Consumption

- Service derivation consumes `requirement`, `domain`, and `capability`
- Workflow generation consumes `requirement`, `domain`, `capability`, and approved `architecture`
- Spring Boot generation consumes approved `architecture`, `domain`, `capability`, `nfr`, and `deployment-intent`
- Angular generation consumes `intent`, `requirement`, `domain`, and approved `execution`
- PostgreSQL generation consumes `domain`, approved `architecture`, and `deployment-intent`
- Kafka generation consumes `architecture`, `execution`, and NFR-linked architecture decisions
- Keycloak planning consumes `actors`, security NFRs, and service sensitivity
- Kubernetes generation consumes approved `architecture`, `deployment-intent`, and scalability/resilience NFRs
