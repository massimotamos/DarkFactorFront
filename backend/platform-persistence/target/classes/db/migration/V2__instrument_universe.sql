-- V2__instrument_universe.sql
-- Instrument universe seed data
-- Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8

-- ============================================================
-- NORTH AMERICA EQUITIES — NYSE / NASDAQ (USD)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AAPL',  'US0378331005', 'Apple Inc.',                          'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'MSFT',  'US5949181045', 'Microsoft Corporation',               'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'GOOGL', 'US02079K3059', 'Alphabet Inc. Class A',               'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AMZN',  'US0231351067', 'Amazon.com Inc.',                     'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'TSLA',  'US88160R1014', 'Tesla Inc.',                          'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'NVDA',  'US67066G1040', 'NVIDIA Corporation',                  'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'META',  'US30303M1027', 'Meta Platforms Inc.',                 'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BRK.B', 'US0846707026', 'Berkshire Hathaway Inc. Class B',    'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'JPM',   'US46625H1005', 'JPMorgan Chase & Co.',                'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'JNJ',   'US4781601046', 'Johnson & Johnson',                   'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'V',     'US92826C8394', 'Visa Inc.',                           'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'PG',    'US7427181091', 'Procter & Gamble Co.',                'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'UNH',   'US91324P1021', 'UnitedHealth Group Inc.',             'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'HD',    'US4370761029', 'The Home Depot Inc.',                 'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'MA',    'US57636Q1040', 'Mastercard Incorporated',             'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'DIS',   'US2546871060', 'The Walt Disney Company',             'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'PYPL',  'US70450Y1038', 'PayPal Holdings Inc.',                'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'NFLX',  'US64110L1061', 'Netflix Inc.',                        'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'ADBE',  'US00724F1012', 'Adobe Inc.',                          'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CRM',   'US79466L3024', 'Salesforce Inc.',                     'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'INTC',  'US4581401001', 'Intel Corporation',                   'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AMD',   'US0079031078', 'Advanced Micro Devices Inc.',         'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'QCOM',  'US7475251036', 'Qualcomm Incorporated',               'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'TXN',   'US8825081040', 'Texas Instruments Incorporated',      'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AVGO',  'US11135F1012', 'Broadcom Inc.',                       'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'COST',  'US22160K1051', 'Costco Wholesale Corporation',        'EQUITY', 'NASDAQ', 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'WMT',   'US9311421039', 'Walmart Inc.',                        'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BAC',   'US0605051046', 'Bank of America Corporation',         'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'XOM',   'US30231G1022', 'Exxon Mobil Corporation',             'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CVX',   'US1667641005', 'Chevron Corporation',                 'EQUITY', 'NYSE',   'USD', 'NORTH_AMERICA', now());

-- ============================================================
-- EUROPE EQUITIES — LSE (GBP)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'SHEL.L', 'GB00BP6MXD84', 'Shell plc',                         'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BP.L',   'GB0007980591', 'BP p.l.c.',                          'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'HSBA.L', 'GB0005405286', 'HSBC Holdings plc',                  'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AZN.L',  'GB0009895292', 'AstraZeneca PLC',                    'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'ULVR.L', 'GB00B10RZP78', 'Unilever PLC',                       'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'RIO.L',  'GB0007188757', 'Rio Tinto Group (LSE)',               'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'GSK.L',  'GB0009252882', 'GSK plc',                            'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'LLOY.L', 'GB0008706128', 'Lloyds Banking Group plc',           'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BARC.L', 'GB0031348658', 'Barclays PLC',                       'EQUITY', 'LSE', 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'VOD.L',  'GB00BH4HKS39', 'Vodafone Group Plc',                 'EQUITY', 'LSE', 'GBP', 'EUROPE', now());

-- ============================================================
-- EUROPE EQUITIES — Euronext (EUR)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'MC.PA',  'FR0000121014', 'LVMH Moët Hennessy Louis Vuitton',   'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'TTE.PA', 'FR0014000MR3', 'TotalEnergies SE',                   'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'SAN.PA', 'FR0000120578', 'Sanofi SA',                          'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AIR.PA', 'NL0000235190', 'Airbus SE',                          'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BNP.PA', 'FR0000131104', 'BNP Paribas SA',                     'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'OR.PA',  'FR0000120321', 'L''Oréal SA',                        'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'SU.PA',  'FR0000121972', 'Schneider Electric SE',              'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'DG.PA',  'FR0000120628', 'Vinci SA',                           'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CAP.PA', 'FR0000125338', 'Capgemini SE',                       'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'KER.PA', 'FR0000121485', 'Kering SA',                          'EQUITY', 'EURONEXT', 'EUR', 'EUROPE', now());

-- ============================================================
-- ASIA-PACIFIC EQUITIES — TSE (JPY)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '7203.T', 'JP3633400001', 'Toyota Motor Corporation',           'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '6758.T', 'JP3435000009', 'Sony Group Corporation',             'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '9984.T', 'JP3436100006', 'SoftBank Group Corp.',               'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '7974.T', 'JP3756600007', 'Nintendo Co., Ltd.',                 'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '6861.T', 'JP3866800000', 'Keyence Corporation',                'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '8306.T', 'JP3902900004', 'Mitsubishi UFJ Financial Group',     'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '9432.T', 'JP3735400008', 'Nippon Telegraph and Telephone',     'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '4063.T', 'JP3473400006', 'Shin-Etsu Chemical Co., Ltd.',       'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '6367.T', 'JP3375200003', 'Daikin Industries, Ltd.',            'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), '6501.T', 'JP3788600009', 'Hitachi, Ltd.',                      'EQUITY', 'TSE', 'JPY', 'ASIA_PACIFIC', now());

-- ============================================================
-- ASIA-PACIFIC EQUITIES — ASX (AUD)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BHP.AX', 'AU000000BHP4', 'BHP Group Limited',                  'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CBA.AX', 'AU000000CBA7', 'Commonwealth Bank of Australia',     'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CSL.AX', 'AU000000CSL8', 'CSL Limited',                        'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'NAB.AX', 'AU000000NAB4', 'National Australia Bank Limited',    'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'WBC.AX', 'AU000000WBC1', 'Westpac Banking Corporation',        'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'ANZ.AX', 'AU000000ANZ3', 'ANZ Group Holdings Limited',         'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'WES.AX', 'AU000000WES1', 'Wesfarmers Limited',                 'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'MQG.AX', 'AU000000MQG1', 'Macquarie Group Limited',            'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'RIO.AX', 'AU000000RIO1', 'Rio Tinto Limited (ASX)',             'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'FMG.AX', 'AU000000FMG4', 'Fortescue Ltd.',                     'EQUITY', 'ASX', 'AUD', 'ASIA_PACIFIC', now());

-- ============================================================
-- NORTH AMERICA BONDS — Sovereign (USD)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'US10Y',  'US912828YV68', 'US Treasury Note 10-Year',           'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'US30Y',  'US912810TM79', 'US Treasury Bond 30-Year',           'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CA10Y',  'CA135087ZV53', 'Government of Canada Bond 10-Year',  'BOND', NULL, 'CAD', 'NORTH_AMERICA', now());

-- ============================================================
-- NORTH AMERICA BONDS — Investment-Grade Corporate (USD)
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AAPL4.65', 'US037833DX48', 'Apple Inc. 4.65% Senior Notes 2030',      'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'MSFT3.95', 'US594918BW84', 'Microsoft Corp. 3.95% Senior Notes 2032', 'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'JPM4.20',  'US46625HRL62', 'JPMorgan Chase 4.20% Senior Notes 2029',  'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BAC4.45',  'US06051GHX57', 'Bank of America 4.45% Senior Notes 2031', 'BOND', NULL, 'USD', 'NORTH_AMERICA', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'XOM3.80',  'US30231GAV29', 'Exxon Mobil 3.80% Senior Notes 2034',     'BOND', NULL, 'USD', 'NORTH_AMERICA', now());

-- ============================================================
-- EUROPE BONDS — Sovereign
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'DE10Y',  'DE0001102580', 'German Federal Bund 10-Year',        'BOND', NULL, 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'FR10Y',  'FR0013508470', 'French OAT 10-Year',                 'BOND', NULL, 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'GB10Y',  'GB00BBJNQY21', 'UK Gilt 10-Year',                    'BOND', NULL, 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'IT10Y',  'IT0005518128', 'Italian BTP 10-Year',                'BOND', NULL, 'EUR', 'EUROPE', now());

-- ============================================================
-- EUROPE BONDS — Investment-Grade Corporate
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'SHEL3.50', 'XS2345678901', 'Shell plc 3.50% Senior Notes 2031',       'BOND', NULL, 'EUR', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'HSBC4.30', 'XS2456789012', 'HSBC Holdings 4.30% Senior Notes 2030',   'BOND', NULL, 'GBP', 'EUROPE', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AZN3.75',  'XS2567890123', 'AstraZeneca 3.75% Senior Notes 2032',     'BOND', NULL, 'EUR', 'EUROPE', now());

-- ============================================================
-- ASIA-PACIFIC BONDS — Sovereign
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'JP10Y',  'JP1300011M46', 'Japan Government Bond 10-Year',      'BOND', NULL, 'JPY', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'AU10Y',  'AU3TB0000119', 'Australian Government Bond 10-Year', 'BOND', NULL, 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CN10Y',  'CNE0000018R5', 'China Government Bond 10-Year',      'BOND', NULL, 'CNY', 'ASIA_PACIFIC', now());

-- ============================================================
-- ASIA-PACIFIC BONDS — Investment-Grade Corporate
-- ============================================================

INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'BHP4.10',  'XS2678901234', 'BHP Group 4.10% Senior Notes 2033',       'BOND', NULL, 'USD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'CBA3.60',  'AU3FN0044032', 'Commonwealth Bank 3.60% Senior Notes 2030','BOND', NULL, 'AUD', 'ASIA_PACIFIC', now());
INSERT INTO instrument (id, ticker, isin, name, asset_class, exchange, currency, region, last_updated)
VALUES (gen_random_uuid(), 'SB7203',   'XS2789012345', 'Toyota Motor 3.20% Senior Notes 2031',    'BOND', NULL, 'JPY', 'ASIA_PACIFIC', now());
