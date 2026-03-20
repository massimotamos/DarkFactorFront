-- V1__init.sql
-- Initial schema for Equity Trading and Investment Portal
-- Requirements: 2.2, 2.3, 3.5, 5.7

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE risk_tolerance AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE');
CREATE TYPE investment_experience AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE income_bracket AS ENUM (
    'UNDER_30K', 'BETWEEN_30K_60K', 'BETWEEN_60K_100K',
    'BETWEEN_100K_200K', 'OVER_200K'
);
CREATE TYPE net_worth_band AS ENUM (
    'UNDER_50K', 'BETWEEN_50K_250K', 'BETWEEN_250K_1M',
    'BETWEEN_1M_5M', 'OVER_5M'
);
CREATE TYPE regional_preference AS ENUM (
    'NORTH_AMERICA', 'EUROPE', 'ASIA_PACIFIC', 'GLOBAL'
);
CREATE TYPE asset_class AS ENUM (
    'EQUITY', 'BOND', 'VANILLA_OPTION', 'SWAP',
    'EXOTIC_OPTION', 'STRUCTURED_PRODUCT'
);
CREATE TYPE market_data_source AS ENUM ('YAHOO', 'ALPHA_VANTAGE', 'CACHE');
CREATE TYPE derivative_type AS ENUM (
    'PROTECTIVE_PUT', 'COVERED_CALL', 'IR_SWAP', 'EXOTIC_OPTION'
);

-- ============================================================
-- user_account
-- ============================================================

CREATE TABLE user_account (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_user_account PRIMARY KEY (id)
);

-- Unique index on email (Requirement: 1.2, design index spec)
CREATE UNIQUE INDEX idx_user_account_email ON user_account (email);

-- ============================================================
-- refresh_token
-- ============================================================

CREATE TABLE refresh_token (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    token_hash  VARCHAR(64) NOT NULL,   -- SHA-256 hex digest (64 chars)
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_refresh_token PRIMARY KEY (id),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id)
        REFERENCES user_account (id) ON DELETE CASCADE
);

-- Index on expires_at for cleanup jobs (design index spec)
CREATE INDEX idx_refresh_token_expires_at ON refresh_token (expires_at);

-- ============================================================
-- financial_profile
-- ============================================================

CREATE TABLE financial_profile (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL,
    risk_tolerance      risk_tolerance  NOT NULL,
    experience          investment_experience NOT NULL,
    income_bracket      income_bracket  NOT NULL,
    net_worth_band      net_worth_band  NOT NULL,
    horizon_months      INTEGER         NOT NULL,
    target_roi_percent  NUMERIC(5, 2)   NOT NULL,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT pk_financial_profile PRIMARY KEY (id),
    CONSTRAINT fk_financial_profile_user FOREIGN KEY (user_id)
        REFERENCES user_account (id) ON DELETE CASCADE,
    -- Requirement 2.2: horizon must be between 1 and 360 months
    CONSTRAINT chk_horizon_months
        CHECK (horizon_months >= 1 AND horizon_months <= 360),
    -- Requirement 2.3: target ROI must be between 0.1% and 50.0%
    CONSTRAINT chk_target_roi_percent
        CHECK (target_roi_percent >= 0.1 AND target_roi_percent <= 50.0)
);

-- ============================================================
-- financial_profile_regions  (join table for Set<RegionalPreference>)
-- ============================================================

CREATE TABLE financial_profile_regions (
    profile_id  UUID                NOT NULL,
    region      regional_preference NOT NULL,

    CONSTRAINT pk_financial_profile_regions PRIMARY KEY (profile_id, region),
    CONSTRAINT fk_fpr_profile FOREIGN KEY (profile_id)
        REFERENCES financial_profile (id) ON DELETE CASCADE
);

-- ============================================================
-- instrument
-- ============================================================

CREATE TABLE instrument (
    id           UUID                NOT NULL DEFAULT gen_random_uuid(),
    ticker       VARCHAR(20)         NOT NULL,
    isin         VARCHAR(12),
    name         VARCHAR(255)        NOT NULL,
    asset_class  asset_class         NOT NULL,
    exchange     VARCHAR(50),
    currency     VARCHAR(3)          NOT NULL,
    region       regional_preference NOT NULL,
    last_updated TIMESTAMPTZ         NOT NULL DEFAULT now(),

    CONSTRAINT pk_instrument PRIMARY KEY (id)
);

CREATE UNIQUE INDEX idx_instrument_ticker ON instrument (ticker);

-- ============================================================
-- portfolio_recommendation
-- ============================================================

CREATE TABLE portfolio_recommendation (
    id                      UUID            NOT NULL DEFAULT gen_random_uuid(),
    user_id                 UUID            NOT NULL,
    generated_at            TIMESTAMPTZ     NOT NULL DEFAULT now(),
    expected_return_percent NUMERIC(6, 2)   NOT NULL,
    volatility_percent      NUMERIC(6, 2)   NOT NULL,

    CONSTRAINT pk_portfolio_recommendation PRIMARY KEY (id),
    CONSTRAINT fk_portfolio_rec_user FOREIGN KEY (user_id)
        REFERENCES user_account (id) ON DELETE CASCADE
);

-- ============================================================
-- allocation_line
-- ============================================================

CREATE TABLE allocation_line (
    id                  UUID            NOT NULL DEFAULT gen_random_uuid(),
    portfolio_id        UUID            NOT NULL,
    instrument_id       UUID            NOT NULL,
    weight_percent      NUMERIC(5, 2)   NOT NULL,
    price_at_generation NUMERIC(18, 6)  NOT NULL,

    CONSTRAINT pk_allocation_line PRIMARY KEY (id),
    CONSTRAINT fk_allocation_portfolio FOREIGN KEY (portfolio_id)
        REFERENCES portfolio_recommendation (id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_instrument FOREIGN KEY (instrument_id)
        REFERENCES instrument (id),
    -- Requirement 3.5: no single allocation may exceed 40%, and must be > 0
    CONSTRAINT chk_weight_percent
        CHECK (weight_percent > 0 AND weight_percent <= 40)
);

-- ============================================================
-- derivative_overlay
-- ============================================================

CREATE TABLE derivative_overlay (
    id           UUID        NOT NULL DEFAULT gen_random_uuid(),
    portfolio_id UUID        NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT pk_derivative_overlay PRIMARY KEY (id),
    CONSTRAINT fk_overlay_portfolio FOREIGN KEY (portfolio_id)
        REFERENCES portfolio_recommendation (id) ON DELETE CASCADE
);

-- ============================================================
-- derivative_position
-- ============================================================

CREATE TABLE derivative_position (
    id                        UUID            NOT NULL DEFAULT gen_random_uuid(),
    overlay_id                UUID            NOT NULL,
    type                      derivative_type NOT NULL,
    description               TEXT            NOT NULL,
    estimated_cost_percent    NUMERIC(6, 2)   NOT NULL,
    max_loss_reduction_percent NUMERIC(6, 2)  NOT NULL,
    -- Black-Scholes inputs (nullable for non-option types)
    spot_price                NUMERIC(18, 6),
    strike_price              NUMERIC(18, 6),
    implied_volatility        NUMERIC(8, 6),
    risk_free_rate            NUMERIC(8, 6),
    time_to_expiry_years      NUMERIC(8, 6),
    notice                    TEXT,

    CONSTRAINT pk_derivative_position PRIMARY KEY (id),
    CONSTRAINT fk_position_overlay FOREIGN KEY (overlay_id)
        REFERENCES derivative_overlay (id) ON DELETE CASCADE
);

-- ============================================================
-- market_data_snapshot
-- ============================================================

CREATE TABLE market_data_snapshot (
    id         UUID                NOT NULL DEFAULT gen_random_uuid(),
    ticker     VARCHAR(20)         NOT NULL,
    price      NUMERIC(18, 6)      NOT NULL,
    currency   VARCHAR(3)          NOT NULL,
    timestamp  TIMESTAMPTZ         NOT NULL,
    source     market_data_source  NOT NULL,
    is_stale   BOOLEAN             NOT NULL DEFAULT FALSE,
    cached_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),

    CONSTRAINT pk_market_data_snapshot PRIMARY KEY (id)
);

-- Unique index on ticker — one snapshot per ticker (upsert on refresh)
-- Requirement 5.7: cache round-trip requires unique lookup by ticker
CREATE UNIQUE INDEX idx_market_data_snapshot_ticker ON market_data_snapshot (ticker);
