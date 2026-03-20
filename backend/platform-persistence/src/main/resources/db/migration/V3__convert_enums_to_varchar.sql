-- V3__convert_enums_to_varchar.sql
-- Convert all PostgreSQL native enum columns to VARCHAR so Hibernate
-- EnumType.STRING binding works without explicit casting.

-- financial_profile
ALTER TABLE financial_profile
    ALTER COLUMN risk_tolerance    TYPE VARCHAR(50)  USING risk_tolerance::text,
    ALTER COLUMN experience        TYPE VARCHAR(50)  USING experience::text,
    ALTER COLUMN income_bracket    TYPE VARCHAR(50)  USING income_bracket::text,
    ALTER COLUMN net_worth_band    TYPE VARCHAR(50)  USING net_worth_band::text;

-- financial_profile_regions
ALTER TABLE financial_profile_regions
    ALTER COLUMN region TYPE VARCHAR(50) USING region::text;

-- instrument
ALTER TABLE instrument
    ALTER COLUMN asset_class TYPE VARCHAR(50) USING asset_class::text,
    ALTER COLUMN region      TYPE VARCHAR(50) USING region::text;

-- derivative_position
ALTER TABLE derivative_position
    ALTER COLUMN type TYPE VARCHAR(50) USING type::text;

-- market_data_snapshot
ALTER TABLE market_data_snapshot
    ALTER COLUMN source TYPE VARCHAR(50) USING source::text;

-- Drop the now-unused enum types
DROP TYPE IF EXISTS risk_tolerance;
DROP TYPE IF EXISTS investment_experience;
DROP TYPE IF EXISTS income_bracket;
DROP TYPE IF EXISTS net_worth_band;
DROP TYPE IF EXISTS regional_preference;
DROP TYPE IF EXISTS asset_class;
DROP TYPE IF EXISTS market_data_source;
DROP TYPE IF EXISTS derivative_type;
