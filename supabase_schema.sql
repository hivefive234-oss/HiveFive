-- ====================================================================
-- HIVEFIVE - SUPABASE POSTGRESQL SCHEMA & INITIAL SEED DATA
-- Project: HoneyChain – Predictive Hive Health & Honey Traceability
-- ====================================================================
-- 
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard -> SQL Editor -> New Query
-- 2. Paste this entire file content
-- 3. Click "Run"
-- 4. All 7 tables, indexes, RLS policies, and seed data will be created
--
-- ====================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLE: hives
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_code TEXT NOT NULL UNIQUE,
    location TEXT DEFAULT 'Coorg Shola Apiary, Madikeri, Karnataka',
    status TEXT DEFAULT 'ACTIVE',
    bee_species TEXT DEFAULT 'Apis cerana indica',
    installation_date DATE DEFAULT '2025-11-15',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. TABLE: hive_telemetry
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hive_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    weight NUMERIC(6, 2),
    bee_activity NUMERIC(5, 2),
    environmental_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. TABLE: hive_ai_results
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hive_ai_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    telemetry_id UUID REFERENCES hive_telemetry(id) ON DELETE SET NULL,
    health_score NUMERIC(5, 2),
    health_status TEXT,
    prediction_probability NUMERIC(5, 4),
    anomaly_risk TEXT,
    model_name TEXT DEFAULT 'XGBoost',
    model_version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. TABLE: beekeeper_actions
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beekeeper_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    observation TEXT,
    notes TEXT,
    action_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. TABLE: honey_batches
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS honey_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL UNIQUE,
    hive_id UUID REFERENCES hives(id) ON DELETE SET NULL,
    hive_code TEXT DEFAULT 'H001',
    honey_type TEXT DEFAULT 'Multifloral Wild Forest',
    harvest_date DATE DEFAULT '2026-09-18',
    quantity NUMERIC(6, 2) DEFAULT 24.50,
    location TEXT DEFAULT 'Coorg Shola Apiary, Madikeri, Karnataka',
    processing_date DATE DEFAULT '2026-09-19',
    packaging_date DATE DEFAULT '2026-09-20',
    quality_status TEXT DEFAULT 'Verified',
    traceability_status TEXT DEFAULT 'Complete',
    ai_health_score NUMERIC(5, 2) DEFAULT 94.00,
    moisture_percentage NUMERIC(4, 1) DEFAULT 17.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. TABLE: batch_events
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batch_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. TABLE: qr_verifications
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES honey_batches(id) ON DELETE CASCADE,
    verification_token TEXT NOT NULL UNIQUE,
    public_url TEXT,
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_hive_telemetry_hive_id ON hive_telemetry(hive_id);
CREATE INDEX IF NOT EXISTS idx_hive_telemetry_timestamp ON hive_telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_hive_ai_results_hive_id ON hive_ai_results(hive_id);
CREATE INDEX IF NOT EXISTS idx_beekeeper_actions_hive_id ON beekeeper_actions(hive_id);
CREATE INDEX IF NOT EXISTS idx_honey_batches_batch_id ON honey_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_honey_batches_harvest_date ON honey_batches(harvest_date);
CREATE INDEX IF NOT EXISTS idx_batch_events_batch_id ON batch_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_verifications_token ON qr_verifications(verification_token);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC ANONYMOUS ACCESS
-- ====================================================================
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE hive_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE hive_ai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE beekeeper_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE honey_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_verifications ENABLE ROW LEVEL SECURITY;

-- Public read + write access policies for SIH demo & QR verification
CREATE POLICY "Public Read Hives" ON hives FOR SELECT USING (true);
CREATE POLICY "Public Insert Hives" ON hives FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Hives" ON hives FOR UPDATE USING (true);

CREATE POLICY "Public Read Telemetry" ON hive_telemetry FOR SELECT USING (true);
CREATE POLICY "Public Insert Telemetry" ON hive_telemetry FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read AI Results" ON hive_ai_results FOR SELECT USING (true);
CREATE POLICY "Public Insert AI Results" ON hive_ai_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Actions" ON beekeeper_actions FOR SELECT USING (true);
CREATE POLICY "Public Insert Actions" ON beekeeper_actions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Honey Batches" ON honey_batches FOR SELECT USING (true);
CREATE POLICY "Public Insert Honey Batches" ON honey_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Honey Batches" ON honey_batches FOR UPDATE USING (true);

CREATE POLICY "Public Read Batch Events" ON batch_events FOR SELECT USING (true);
CREATE POLICY "Public Insert Batch Events" ON batch_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read QR Verifications" ON qr_verifications FOR SELECT USING (true);
CREATE POLICY "Public Insert QR Verifications" ON qr_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update QR Verifications" ON qr_verifications FOR UPDATE USING (true);

-- Enable Supabase Realtime on critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE hive_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE hive_ai_results;

-- ====================================================================
-- SEED INITIAL HIVEFIVE DATA
-- ====================================================================
INSERT INTO hives (hive_code, location, status, bee_species, installation_date) VALUES
  ('H001', 'Coorg Shola Apiary, Hive Row A1', 'ACTIVE', 'Apis cerana indica', '2025-11-15'),
  ('H002', 'Coorg Shola Apiary, Hive Row A2', 'ACTIVE', 'Apis cerana indica', '2025-11-15'),
  ('H003', 'Coorg Shola Apiary, Hive Row B1', 'ACTIVE', 'Apis dorsata', '2025-11-20'),
  ('H004', 'Madikeri Forest Apiary, Hive Row C1', 'ATTENTION', 'Apis mellifera', '2025-12-01'),
  ('H005', 'Madikeri Forest Apiary, Hive Row C2', 'RECOVERING', 'Apis cerana indica', '2025-12-10')
ON CONFLICT (hive_code) DO NOTHING;

-- Seed Sample Honey Batches
INSERT INTO honey_batches (batch_id, hive_code, honey_type, harvest_date, quantity, location, processing_date, packaging_date, quality_status, traceability_status, ai_health_score, moisture_percentage) VALUES
  ('HC-2026-001', 'H001', 'Multifloral Wild Forest', '2026-09-18', 24.50, 'Coorg Shola Apiary, Madikeri, Karnataka', '2026-09-19', '2026-09-20', 'Verified', 'Complete', 94.00, 17.8),
  ('HC-2026-002', 'H002', 'Eucalyptus Bloom Honey', '2026-09-19', 31.00, 'Coorg Shola Apiary, Madikeri, Karnataka', '2026-09-20', '2026-09-21', 'Verified', 'Complete', 91.00, 18.1),
  ('HC-2026-003', 'H003', 'Acacia Blossom Honey', '2026-09-20', 18.20, 'Madikeri Forest Apiary, Karnataka', '2026-09-21', '2026-09-22', 'Verified', 'Complete', 88.00, 17.4)
ON CONFLICT (batch_id) DO NOTHING;

-- Seed Telemetry Data for H001 (latest readings)
INSERT INTO hive_telemetry (hive_id, temperature, humidity, weight, bee_activity, environmental_score)
SELECT id, 34.5, 55.0, 44.2, 87.0, 91.0 FROM hives WHERE hive_code = 'H001'
UNION ALL
SELECT id, 34.8, 56.2, 44.0, 85.0, 90.0 FROM hives WHERE hive_code = 'H001'
UNION ALL
SELECT id, 35.1, 54.8, 44.5, 88.0, 92.0 FROM hives WHERE hive_code = 'H001';

-- Seed Telemetry Data for H004 (attention hive - elevated values)
INSERT INTO hive_telemetry (hive_id, temperature, humidity, weight, bee_activity, environmental_score)
SELECT id, 37.2, 72.0, 38.5, 45.0, 58.0 FROM hives WHERE hive_code = 'H004'
UNION ALL
SELECT id, 37.5, 73.1, 38.2, 42.0, 55.0 FROM hives WHERE hive_code = 'H004';

-- Seed AI Results
INSERT INTO hive_ai_results (hive_id, health_score, health_status, prediction_probability, anomaly_risk, model_name, model_version)
SELECT id, 94.0, 'Healthy', 0.9412, 'Low', 'XGBoost', 'v1.0' FROM hives WHERE hive_code = 'H001';

INSERT INTO hive_ai_results (hive_id, health_score, health_status, prediction_probability, anomaly_risk, model_name, model_version)
SELECT id, 55.0, 'At Risk', 0.6823, 'High', 'XGBoost', 'v1.0' FROM hives WHERE hive_code = 'H004';

-- Seed Sample QR Verification Token
INSERT INTO qr_verifications (batch_id, verification_token, public_url)
SELECT id, 'HC-2026-001', '/verify/HC-2026-001'
FROM honey_batches WHERE batch_id = 'HC-2026-001'
ON CONFLICT (verification_token) DO NOTHING;

-- Seed Batch Events for Traceability
INSERT INTO batch_events (batch_id, event_type, description, event_date)
SELECT id, 'Hive Registered', 'Colony H001 registered at Coorg Shola Apiary', '2025-11-15'::TIMESTAMPTZ
FROM honey_batches WHERE batch_id = 'HC-2026-001';

INSERT INTO batch_events (batch_id, event_type, description, event_date)
SELECT id, 'Honey Harvested', '24.5 kg cold-extracted by Lead Beekeeper', '2026-09-18'::TIMESTAMPTZ
FROM honey_batches WHERE batch_id = 'HC-2026-001';

INSERT INTO batch_events (batch_id, event_type, description, event_date)
SELECT id, 'Quality Verified', 'Lab refractometer moisture verified at 17.2%', '2026-09-19'::TIMESTAMPTZ
FROM honey_batches WHERE batch_id = 'HC-2026-001';

INSERT INTO batch_events (batch_id, event_type, description, event_date)
SELECT id, 'QR Generated', 'Smart Contract EIP-155 seal & QR Code generated', '2026-09-20'::TIMESTAMPTZ
FROM honey_batches WHERE batch_id = 'HC-2026-001';

-- Seed a sample beekeeper action
INSERT INTO beekeeper_actions (hive_id, action_type, observation, notes)
SELECT id, 'Ventilation Screen Adjustment', 'Colony showed high humidity stress near entrance', 'Opened upper ventilation screens and cleared bottom board debris'
FROM hives WHERE hive_code = 'H004';
