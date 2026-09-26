-- HONEYCHAIN Database Schema Reference DDL (21 Models)

CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'beekeeper', -- 'beekeeper', 'admin', 'consumer', 'kvic'
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Beekeepers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE REFERENCES Users(id) ON DELETE CASCADE,
  registration_number VARCHAR(100) UNIQUE,
  state VARCHAR(100),
  district VARCHAR(100),
  address TEXT,
  experience_years INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Apiaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beekeeper_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  flora_type VARCHAR(255),
  total_hives INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Hives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apiary_id INTEGER REFERENCES Apiaries(id) ON DELETE CASCADE,
  hive_code VARCHAR(100) UNIQUE NOT NULL,
  species VARCHAR(100) DEFAULT 'Apis cerana indica',
  installation_date DATE,
  current_health_score DECIMAL(5, 2) DEFAULT 85.00,
  current_risk_level VARCHAR(50) DEFAULT 'LOW',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  queen_status VARCHAR(50) DEFAULT 'HEALTHY',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS SensorReadings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  weight_kg DECIMAL(6, 2),
  sound_frequency_hz DECIMAL(7, 2),
  bee_count_in INTEGER DEFAULT 0,
  bee_count_out INTEGER DEFAULT 0,
  raw_payload TEXT
);

CREATE TABLE IF NOT EXISTS QueenObservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  observation_date DATE NOT NULL,
  queen_spotted BOOLEAN DEFAULT TRUE,
  marking_color VARCHAR(50),
  laying_pattern VARCHAR(50) DEFAULT 'EXCELLENT',
  queen_age_months INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BroodFrameRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  capped_brood_percent DECIMAL(5,2),
  open_brood_percent DECIMAL(5,2),
  egg_presence BOOLEAN DEFAULT TRUE,
  honey_stores_percent DECIMAL(5,2),
  pollen_stores_percent DECIMAL(5,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AcousticAnalysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  dominant_freq_hz DECIMAL(7,2),
  swarming_indicator DECIMAL(5,2),
  queenlessness_probability DECIMAL(5,2),
  stress_score DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS HiveHealthScores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  overall_score DECIMAL(5,2),
  temperature_score DECIMAL(5,2),
  humidity_score DECIMAL(5,2),
  weight_trend_score DECIMAL(5,2),
  acoustic_score DECIMAL(5,2),
  brood_score DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS RiskPredictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  prediction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  risk_level VARCHAR(50),
  predicted_risk_score DECIMAL(5,2),
  horizon_days INTEGER DEFAULT 7,
  primary_risk_driver VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS XAIFactors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prediction_id INTEGER REFERENCES RiskPredictions(id) ON DELETE CASCADE,
  feature_name VARCHAR(100),
  shap_value DECIMAL(8,4),
  contribution_percent DECIMAL(5,2),
  direction VARCHAR(20) -- 'INCREASING_RISK', 'DECREASING_RISK'
);

CREATE TABLE IF NOT EXISTS ActionSimulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  action_type VARCHAR(100),
  simulated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  predicted_health_gain DECIMAL(5,2),
  predicted_risk_reduction DECIMAL(5,2),
  cost_estimate_inr DECIMAL(8,2)
);

CREATE TABLE IF NOT EXISTS Recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  action_recommended VARCHAR(255),
  urgency VARCHAR(50), -- 'HIGH', 'MEDIUM', 'LOW'
  explanation TEXT,
  status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS ProductionEstimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  estimated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  projected_yield_kg DECIMAL(6,2),
  loss_risk_percent DECIMAL(5,2),
  potential_loss_kg DECIMAL(6,2)
);

CREATE TABLE IF NOT EXISTS BeekeeperActions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  action_date DATE NOT NULL,
  notes TEXT,
  cost_inr DECIMAL(8,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RecoveryRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id INTEGER REFERENCES BeekeeperActions(id) ON DELETE CASCADE,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  checkpoint_date DATE NOT NULL,
  health_score_after DECIMAL(5,2),
  recovered BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS HoneyBatches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id VARCHAR(100) UNIQUE NOT NULL,
  hive_id INTEGER REFERENCES Hives(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL,
  quantity_kg DECIMAL(8,2) NOT NULL,
  flora_source VARCHAR(255),
  region VARCHAR(255),
  canonical_hash VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'registered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS BlockchainRecords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id VARCHAR(100) UNIQUE REFERENCES HoneyBatches(batch_id) ON DELETE CASCADE,
  tx_hash VARCHAR(255),
  block_number INTEGER,
  smart_contract_address VARCHAR(255),
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS VerificationLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id VARCHAR(100),
  verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verification_result VARCHAR(50),
  client_ip VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS AuditLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_email VARCHAR(255),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS IoTGatewayEvents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id VARCHAR(100),
  event_type VARCHAR(100),
  payload TEXT,
  logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
