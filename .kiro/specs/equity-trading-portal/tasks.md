# Implementation Plan: Equity Trading and Investment Portal

## Overview

Full replacement of the existing Angular + Spring Boot platform. The backend is rebuilt as a Java 21 / Spring Boot 3.5 multi-module Maven project; the frontend is rebuilt as an Angular 21 (TypeScript) SPA. Both are containerised via Docker Compose. Implementation proceeds module-by-module so each layer can be tested before the next is built on top of it.

## Tasks

- [-] 1. Scaffold Maven multi-module backend and replace existing modules
  - Delete all existing backend modules (`platform-dsl-core`, `platform-initiative-domain`, `platform-epic-domain`, `platform-story-domain`, `platform-graph-domain`, `platform-persistence`, `platform-rest-api`, `platform-boot`)
  - Rewrite root `backend/pom.xml` declaring modules: `auth-service`, `profile-service`, `portfolio-engine`, `risk-engine`, `market-data-service`, `platform-persistence`, `platform-rest-api`, `platform-boot`
  - Add shared dependency management: Spring Boot 3.5 BOM, jqwik 1.8.x, AssertJ, Mockito, TestContainers, WireMock
  - Create skeleton `pom.xml` for each of the eight modules with correct `<parent>` and `<artifactId>`
  - _Requirements: 10.2_

- [ ] 2. Implement `platform-persistence` — JPA entities, repositories, Flyway migrations
  - [~] 2.1 Write Flyway migration `V1__init.sql` creating tables: `user_account`, `refresh_token`, `financial_profile`, `instrument`, `portfolio_recommendation`, `allocation_line`, `derivative_overlay`, `derivative_position`, `market_data_snapshot`
    - Apply all CHECK constraints from design (`horizon_months` 1–360, `target_roi_percent` 0.1–50.0, `weight_percent` 0 < x ≤ 40)
    - Add indexes: `user_account.email` (unique), `refresh_token.expires_at`, `market_data_snapshot.ticker` (unique)
    - _Requirements: 2.2, 2.3, 3.5, 5.7_
  - [~] 2.2 Implement JPA entities: `UserAccount`, `RefreshToken`, `FinancialProfile`, `Instrument`, `PortfolioRecommendation`, `AllocationLine`, `DerivativeOverlay`, `DerivativePosition`, `MarketDataSnapshot`
    - Use `UUID` primary keys, `@OneToMany` for allocations and derivative positions
    - _Requirements: 1.8, 2.1, 3.7, 4.5, 5.7_
  - [~] 2.3 Write Spring Data JPA repositories for all entities
    - `UserAccountRepository.findByEmail`, `RefreshTokenRepository.findByTokenHashAndRevokedFalse`, `FinancialProfileRepository.findByUserId`, `PortfolioRecommendationRepository.findByUserIdOrderByGeneratedAtDesc`, `MarketDataSnapshotRepository.findByTicker`
    - _Requirements: 1.2, 1.5, 2.6, 3.8, 5.7_

- [ ] 3. Implement `auth-service` — registration, login, JWT, refresh, logout
  - [~] 3.1 Implement `UserRegistrationService`: validate unique email, validate password length ≥ 12, hash with bcrypt cost 12, persist `UserAccount`
    - _Requirements: 1.1, 1.2, 1.3, 1.8_
  - [~] 3.2 Write property test for valid registration (Property 1)
    - **Property 1: Valid registration succeeds**
    - **Validates: Requirements 1.1**
  - [~] 3.3 Write property test for short password rejection (Property 2)
    - **Property 2: Short password rejected**
    - **Validates: Requirements 1.3**
  - [~] 3.4 Implement `JwtService`: issue access token (60 min expiry), issue refresh token (7 days), validate token, extract claims
    - Store refresh token as SHA-256 hash in `RefreshToken` entity
    - _Requirements: 1.4, 1.5, 1.7_
  - [~] 3.5 Write property test for login token structure (Property 3)
    - **Property 3: Login returns correctly structured tokens**
    - **Validates: Requirements 1.4**
  - [~] 3.6 Implement `AuthenticationService`: login (verify bcrypt hash, return tokens), refresh (validate stored hash, issue new JWT), logout (mark `RefreshToken.revoked = true`)
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  - [~] 3.7 Write property test for refresh token round-trip (Property 4)
    - **Property 4: Refresh token round-trip**
    - **Validates: Requirements 1.5, 10.5**
  - [~] 3.8 Write property test for invalid credentials returning generic 401 (Property 5)
    - **Property 5: Invalid credentials return generic 401**
    - **Validates: Requirements 1.6**
  - [~] 3.9 Write property test for logout invalidating refresh token (Property 6)
    - **Property 6: Logout invalidates refresh token**
    - **Validates: Requirements 1.7**
  - [~] 3.10 Write unit tests for `auth-service`: duplicate email → 409, bcrypt cost verification, expired token rejection
    - _Requirements: 1.2, 1.8_

- [~] 4. Checkpoint — Ensure all auth-service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement `profile-service` — financial profile CRUD and validation
  - [~] 5.1 Implement `FinancialProfileService`: create (HTTP 201), update (HTTP 200), retrieve (HTTP 200); validate all required fields present, horizon 1–360, ROI 0.1–50.0, regions non-empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [~] 5.2 Write property test for valid profile persisted and retrievable (Property 7)
    - **Property 7: Valid financial profile persisted and retrievable**
    - **Validates: Requirements 2.1, 2.6**
  - [~] 5.3 Write property test for out-of-range horizon rejection (Property 8)
    - **Property 8: Out-of-range horizon rejected**
    - **Validates: Requirements 2.2**
  - [~] 5.4 Write property test for out-of-range ROI rejection (Property 9)
    - **Property 9: Out-of-range ROI rejected**
    - **Validates: Requirements 2.3**
  - [~] 5.5 Write property test for missing required fields rejection (Property 10)
    - **Property 10: Missing required profile fields rejected**
    - **Validates: Requirements 2.7**
  - [~] 5.6 Write property test for profile update round-trip (Property 11)
    - **Property 11: Profile update round-trip**
    - **Validates: Requirements 2.5, 2.6**
  - [~] 5.7 Write unit tests for `profile-service`: empty regions → 400, missing fields → 400, update replaces previous record
    - _Requirements: 2.4, 2.5, 2.7_

- [ ] 6. Implement `market-data-service` — ingestion, caching, provider failover
  - [~] 6.1 Implement `YahooFinanceClient` and `AlphaVantageClient` as HTTP clients (using Spring `WebClient`); implement `MarketDataProvider` interface with `fetchQuote(ticker)` and `fetchHistory(ticker, from, to)`
    - _Requirements: 5.1, 5.4, 5.8_
  - [~] 6.2 Implement `MarketDataIngestionService`: poll/push loop, upsert `MarketDataSnapshot` in cache, switch to Alpha Vantage fallback after 30 s primary unavailability, log WARN on failover
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_
  - [~] 6.3 Write property test for market data cache round-trip (Property 23)
    - **Property 23: Market data cache round-trip**
    - **Validates: Requirements 5.7**
  - [~] 6.4 Write property test for staleness flag on old snapshots (Property 24)
    - **Property 24: Staleness flag set for old market data**
    - **Validates: Requirements 7.8**
  - [~] 6.5 Implement `MarketDataSnapshotSerializer`: JSON serialisation/deserialisation of `MarketDataSnapshot`; implement pretty-printer; validate required fields (`ticker`, `price`, `timestamp`) on deserialisation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [~] 6.6 Write property test for MarketDataSnapshot serialisation round-trip (Property 27)
    - **Property 27: MarketDataSnapshot serialisation round-trip**
    - **Validates: Requirements 9.1, 9.2, 9.4, 9.5**
  - [~] 6.7 Write property test for incomplete JSON payload rejection (Property 28)
    - **Property 28: Incomplete JSON market data payload rejected**
    - **Validates: Requirements 9.3**
  - [~] 6.8 Write unit tests for `market-data-service`: provider failover (WireMock), cache staleness, ticker not found → 404, date range > 5 years → 400
    - _Requirements: 5.5, 5.6, 5.8_

- [ ] 7. Seed instrument universe in `platform-persistence`
  - [~] 7.1 Write Flyway migration `V2__instrument_universe.sql` inserting ≥ 50 equities (NYSE/NASDAQ, LSE/Euronext, TSE/ASX) and ≥ 20 bonds (sovereign + investment-grade corporate) across North America, Europe, Asia-Pacific
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 8. Implement `portfolio-engine` — recommendation generation
  - [~] 8.1 Implement `InstrumentUniverseService`: query instruments by asset class and region from `platform-persistence`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [~] 8.2 Implement `PortfolioRecommendationService`: generate weighted allocation satisfying asset-class rules (equity + bond required; structured product for aggressive + horizon > 36 months), weights sum to 100%, no single weight > 40%, fetch current prices from `market-data-service`, persist recommendation with timestamp
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.9_
  - [~] 8.3 Write property test for portfolio containing required asset classes (Property 12)
    - **Property 12: Portfolio recommendation contains required asset classes**
    - **Validates: Requirements 3.2**
  - [~] 8.4 Write property test for aggressive long-horizon portfolio including structured product (Property 13)
    - **Property 13: Aggressive long-horizon portfolio includes structured product**
    - **Validates: Requirements 3.3**
  - [~] 8.5 Write property test for allocation weights summing to 100% (Property 14)
    - **Property 14: Allocation weights sum to 100%**
    - **Validates: Requirements 3.4**
  - [~] 8.6 Write property test for no single allocation exceeding 40% (Property 15)
    - **Property 15: No single allocation exceeds 40%**
    - **Validates: Requirements 3.5**
  - [~] 8.7 Implement `RecommendationHistoryService`: retrieve all recommendations for user ordered by `generatedAt` descending
    - _Requirements: 3.8_
  - [~] 8.8 Write property test for historical recommendations ordered descending (Property 16)
    - **Property 16: Historical recommendations ordered by timestamp descending**
    - **Validates: Requirements 3.8**
  - [~] 8.9 Write unit tests for `portfolio-engine`: no profile → 422, market data unavailable → proceed with cache + `dataWarning`, allocation weight constraints
    - _Requirements: 3.1, 3.6, 3.9_

- [~] 9. Checkpoint — Ensure all portfolio-engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement `risk-engine` — derivative overlay and Black-Scholes pricing
  - [~] 10.1 Implement `BlackScholesPricingService`: compute European call/put option price given spot, strike, volatility, risk-free rate, time to expiry
    - _Requirements: 4.8_
  - [~] 10.2 Implement `DerivativeOverlayService`: for a given `PortfolioRecommendation`, generate overlay containing: vanilla options for equity allocations > 10%, IR swap for bond portfolios with horizon > 12 months, exotic option for aggressive risk profiles; populate `estimatedCostPercent` and `maxLossReductionPercent`; handle missing pricing data by excluding position and setting `notice`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [~] 10.3 Write property test for derivative overlay non-empty for any portfolio (Property 17)
    - **Property 17: Derivative overlay is non-empty for any portfolio**
    - **Validates: Requirements 4.1**
  - [~] 10.4 Write property test for vanilla options proposed for large equity allocations (Property 18)
    - **Property 18: Vanilla options proposed for large equity allocations**
    - **Validates: Requirements 4.2**
  - [~] 10.5 Write property test for IR swap proposed for bond portfolios with long horizon (Property 19)
    - **Property 19: IR swap proposed for bond portfolios with long horizon**
    - **Validates: Requirements 4.3**
  - [~] 10.6 Write property test for exotic option included for aggressive risk profiles (Property 20)
    - **Property 20: Exotic option included for aggressive risk profiles**
    - **Validates: Requirements 4.4**
  - [~] 10.7 Write property test for derivative position fields present and non-negative (Property 21)
    - **Property 21: Derivative position fields are present and non-negative**
    - **Validates: Requirements 4.5, 4.6**
  - [~] 10.8 Write property test for Black-Scholes inputs documented for vanilla options (Property 22)
    - **Property 22: Black-Scholes inputs documented for vanilla options**
    - **Validates: Requirements 4.8**
  - [~] 10.9 Write unit tests for `risk-engine`: unavailable pricing → `notice` field populated, position excluded; all derivative types generated for correct profile conditions
    - _Requirements: 4.7_

- [ ] 11. Implement `platform-rest-api` — REST controllers, WebSocket, global error handling
  - [~] 11.1 Implement `AuthController`: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`; wire to `auth-service`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [~] 11.2 Implement `ProfileController`: `POST /api/profile`, `PUT /api/profile`, `GET /api/profile`; wire to `profile-service`; require JWT
    - _Requirements: 2.1, 2.5, 2.6_
  - [~] 11.3 Implement `PortfolioController`: `POST /api/portfolio/recommend`, `GET /api/portfolio/history`, `GET /api/portfolio/history/{id}`; wire to `portfolio-engine`; require JWT
    - _Requirements: 3.1, 3.6, 3.7, 3.8_
  - [~] 11.4 Implement `RiskController`: `GET /api/risk/overlay/{portfolioId}`; wire to `risk-engine`; require JWT
    - _Requirements: 4.1_
  - [~] 11.5 Implement `MarketDataController`: `GET /api/market-data/quote/{ticker}`, `GET /api/market-data/history/{ticker}`, `GET /api/market-data/reference/{ticker}`; wire to `market-data-service`; require JWT
    - _Requirements: 5.1, 5.8, 5.9_
  - [~] 11.6 Implement WebSocket endpoint `/ws/market-data` using STOMP over SockJS; publish `PriceUpdateMessage` to `/topic/prices/{ticker}` on each cache refresh; authenticate via JWT at handshake
    - _Requirements: 5.2, 5.3_
  - [~] 11.7 Implement `GlobalExceptionHandler` (`@ControllerAdvice`): catch all unhandled exceptions, log full stack trace with correlation ID, return sanitised HTTP 500 with correlation ID in body; never expose stack traces in responses
    - _Requirements: 10.7_
  - [~] 11.8 Write property test for input sanitisation rejecting injection patterns (Property 29)
    - **Property 29: Input sanitisation rejects injection patterns**
    - **Validates: Requirements 10.4**
  - [~] 11.9 Write property test for unhandled exceptions returning generic 500 (Property 30)
    - **Property 30: Unhandled exceptions return generic 500**
    - **Validates: Requirements 10.7**
  - [~] 11.10 Implement Spring Security JWT filter: validate `Authorization: Bearer` header on protected endpoints, return 401 on expired/invalid token
    - _Requirements: 1.4, 10.3_
  - [~] 11.11 Write Spring Boot `@SpringBootTest` slice integration tests for each controller using TestContainers (PostgreSQL) and WireMock (Yahoo Finance, Alpha Vantage)
    - _Requirements: 10.1_

- [ ] 12. Implement `platform-boot` — Spring Boot entry point and Docker packaging
  - [~] 12.1 Implement `PlatformBootApplication` main class; wire all modules via Spring component scan
    - _Requirements: 10.2_
  - [~] 12.2 Write `backend/Dockerfile`: multi-stage build (Maven build → JRE 21 runtime image), expose port 8080
    - _Requirements: 10.2_
  - [~] 12.3 Update `docker-compose.yml`: ensure `frontend`, `backend`, `postgres` services are correctly configured; add `SPRING_DATASOURCE_URL` env var pointing to `postgres` service; add Flyway auto-run on startup
    - _Requirements: 10.2_

- [~] 13. Checkpoint — Ensure all backend tests pass and Docker Compose builds successfully
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Rebuild Angular frontend — project structure and core module
  - [~] 14.1 Reset Angular project: update `package.json` to add `@stomp/stompjs`, `sockjs-client`, `fast-check`, `chart.js` (or `ng2-charts`); remove stale dependencies; regenerate `src/app` with standalone component architecture
    - _Requirements: 5.2, 7.4_
  - [~] 14.2 Implement `core/` module: `JwtService` (store/retrieve/decode tokens from `localStorage`), `AuthInterceptor` (attach Bearer header, intercept 401 to trigger refresh, redirect to login on refresh failure), `AuthGuard`
    - _Requirements: 1.4, 1.5, 10.5_
  - [~] 14.3 Implement `core/auth.service.ts`: `login()`, `register()`, `refresh()`, `logout()` calling `/api/auth/*`; auto-refresh JWT before expiry using `setTimeout`
    - _Requirements: 1.1, 1.4, 1.5, 1.7, 10.5_

- [ ] 15. Implement Angular `features/auth` — login and registration pages
  - [~] 15.1 Implement `LoginComponent` and `RegisterComponent` as standalone components with reactive forms; display inline validation errors; navigate to dashboard on success
    - _Requirements: 1.1, 1.3, 1.6, 8.3_

- [ ] 16. Implement Angular `features/wizard` — financial profile wizard
  - [~] 16.1 Implement `WizardComponent` with 5 steps (risk tolerance + experience, income + net worth, horizon, regions, target ROI); use reactive forms with per-step validation; display progress indicator; pre-populate from existing profile on load
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_
  - [~] 16.2 Implement `WizardStateService`: hold wizard form values in memory across steps; expose `goBack()` and `goForward()` methods that preserve entered values
    - _Requirements: 8.4_
  - [~] 16.3 Write fast-check property test for wizard back navigation retaining values (Property 25)
    - **Property 25: Wizard back navigation retains values**
    - **Validates: Requirements 8.4**
  - [~] 16.4 Write fast-check property test for wizard pre-populating from existing profile (Property 26)
    - **Property 26: Wizard pre-populates from existing profile**
    - **Validates: Requirements 8.7**
  - [~] 16.5 Implement `profile.service.ts`: `createProfile()`, `updateProfile()`, `getProfile()` calling `/api/profile`
    - _Requirements: 2.1, 2.5, 2.6_

- [ ] 17. Implement Angular `features/dashboard` — portfolio, overlay, and live prices
  - [~] 17.1 Implement `portfolio.service.ts`: `generateRecommendation()`, `getHistory()`, `getHistoryById()` calling `/api/portfolio/*`
    - _Requirements: 3.1, 3.8_
  - [~] 17.2 Implement `market-data.service.ts`: `getQuote()`, `getHistory()` via REST; `subscribeToPrice()` via STOMP/SockJS WebSocket to `/topic/prices/{ticker}`; fall back to 60 s polling on WebSocket disconnect; display "Live updates paused" banner on fallback
    - _Requirements: 5.2, 5.3, 7.3_
  - [~] 17.3 Implement `DashboardComponent`: display most recent portfolio recommendation (allocation table + donut chart), derivative overlay positions, live prices with daily change; update price display within 1 s of WebSocket push; show staleness warning banner when `isStale = true` or data age > 120 s
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8_
  - [~] 17.4 Implement `HistoryComponent`: list historical recommendations; on selection display recommendation details and prices at time of generation
    - _Requirements: 7.7_
  - [~] 17.5 Write unit tests for `DashboardComponent`: staleness banner when `isStale = true`, price update on WebSocket message, fallback polling on disconnect
    - _Requirements: 7.3, 7.8_

- [ ] 18. Implement Angular `shared/` — reusable components and error handling
  - [~] 18.1 Implement global HTTP error handler: display inline 4xx errors in relevant components; display global toast with correlation ID for 5xx errors
    - _Requirements: 10.7_
  - [~] 18.2 Write unit tests for `AuthInterceptor`: token refresh on 401, redirect to login on refresh failure
    - _Requirements: 1.5, 10.5_

- [~] 19. Write `Dockerfile.frontend` for Angular production build
  - Multi-stage: `node:22` build stage running `ng build --configuration production`, then `nginx:alpine` serving `dist/` on port 4200; include Nginx reverse-proxy config forwarding `/api/**` and `/ws/**` to `backend:8080`
  - _Requirements: 10.2_

- [~] 20. Final checkpoint — Ensure all tests pass end-to-end
  - Ensure all backend and frontend tests pass, Docker Compose builds all three services, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- All 30 correctness properties from the design document have corresponding property-based test sub-tasks (Properties 1–24, 27–30 in Java/jqwik; Properties 25–26 in TypeScript/fast-check)
- Checkpoints at tasks 4, 9, 13, and 20 ensure incremental validation before building the next layer
- Backend property tests use jqwik; frontend property tests use fast-check
