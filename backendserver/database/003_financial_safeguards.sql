-- Additive financial audit structures. Existing paid history is never rewritten.
CREATE TABLE IF NOT EXISTS lo_financial_lock (
  id TINYINT PRIMARY KEY
) ENGINE=InnoDB;
INSERT IGNORE INTO lo_financial_lock VALUES (1);

CREATE TABLE IF NOT EXISTS lo_allocations (
  activation_id BIGINT UNSIGNED NOT NULL,
  category VARCHAR(30) NOT NULL,
  amount DECIMAL(14,6) NOT NULL,
  PRIMARY KEY (activation_id, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_pool_movements (
  movement_code VARCHAR(80) PRIMARY KEY,
  activation_id BIGINT UNSIGNED NOT NULL,
  pool VARCHAR(30) NOT NULL,
  amount DECIMAL(14,6) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_volumes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NOT NULL,
  tree_type ENUM('BINARY','ENROLLMENT') NOT NULL,
  leg_id INT UNSIGNED NOT NULL,
  status ENUM('CARRY','CONSUMED','INVALID') NOT NULL DEFAULT 'CARRY',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source_leg (sale_id, beneficiary_id, tree_type),
  KEY (beneficiary_id, tree_type, status, leg_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_volume_pairs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  decision_key VARCHAR(100) NOT NULL,
  sale_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NOT NULL,
  tree_type ENUM('BINARY','ENROLLMENT') NOT NULL,
  first_volume_id BIGINT UNSIGNED NOT NULL,
  second_volume_id BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_first_volume (first_volume_id),
  UNIQUE KEY uq_second_volume (second_volume_id),
  KEY (decision_key), KEY (sale_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_matching_decisions (
  decision_key VARCHAR(100) PRIMARY KEY,
  event_code VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_statements (
  statement_code VARCHAR(60) PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  statement_date DATE NOT NULL,
  matching_paid DECIMAL(14,6) NOT NULL,
  event_count INT UNSIGNED NOT NULL,
  closed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_day (user_id, statement_date)
) ENGINE=InnoDB;

-- Keep all historical aggregates pending reconciliation; they are not converted
-- into invented source rows. New source rows drive new matching calculations.
INSERT IGNORE INTO lo_settings (k,v) VALUES ('financial_release_approved','0');