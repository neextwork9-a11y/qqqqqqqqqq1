-- ============================================================
-- Life OS commission engine tables (additive; legacy tables in 001 are untouched,
-- so old user data can be imported into `users` / `user_wallets` as-is).
-- ============================================================
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS lo_migrations (
  name VARCHAR(190) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Binary placement tree + enrollment tree are stored separately.
CREATE TABLE IF NOT EXISTS lo_tree (
  user_id INT UNSIGNED PRIMARY KEY,
  sponsor_id INT UNSIGNED NULL,               -- enrollment tree parent
  placement_parent_id INT UNSIGNED NULL,      -- binary tree parent
  placement_side ENUM('L','R') NULL,
  left_child_id INT UNSIGNED NULL,
  right_child_id INT UNSIGNED NULL,
  left_carry DECIMAL(14,3) NOT NULL DEFAULT 0,  -- unmatched binary volume
  right_carry DECIMAL(14,3) NOT NULL DEFAULT 0,
  left_consumed DECIMAL(14,3) NOT NULL DEFAULT 0,
  right_consumed DECIMAL(14,3) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  lifetime_matchings INT UNSIGNED NOT NULL DEFAULT 0,
  KEY (sponsor_id), KEY (placement_parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrollment leg volume per (upline, direct-leg child)
CREATE TABLE IF NOT EXISTS lo_enroll_legs (
  upline_id INT UNSIGNED NOT NULL,
  leg_user_id INT UNSIGNED NOT NULL,
  carry DECIMAL(14,3) NOT NULL DEFAULT 0,
  consumed DECIMAL(14,3) NOT NULL DEFAULT 0,
  PRIMARY KEY (upline_id, leg_user_id)
) ENGINE=InnoDB;

-- Payment-verified activation = one qualifying sale
CREATE TABLE IF NOT EXISTS lo_activations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activation_code VARCHAR(40) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  payment_ref VARCHAR(120) NOT NULL UNIQUE,   -- gateway trx id: duplicate notifications are ignored
  payment_status ENUM('PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  fee DECIMAL(14,3) NOT NULL DEFAULT 1000,
  bv INT NOT NULL DEFAULT 1000,
  processed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_sales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_code VARCHAR(40) NOT NULL UNIQUE,
  activation_id BIGINT UNSIGNED NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  matching_count TINYINT UNSIGNED NOT NULL DEFAULT 0,   -- never reset
  matching_reserve DECIMAL(14,6) NOT NULL DEFAULT 300,
  matching_paid DECIMAL(14,6) NOT NULL DEFAULT 0,
  generation_paid DECIMAL(14,3) NOT NULL DEFAULT 0,
  rank_pool DECIMAL(14,3) NOT NULL DEFAULT 200,
  status ENUM('OPEN','EXHAUSTED','REVERSED') NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bills: calculation results only, never payments
CREATE TABLE IF NOT EXISTS lo_matching_bills (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NOT NULL,
  bill_type ENUM('ENROLLMENT','BINARY') NOT NULL,
  amount DECIMAL(14,6) NOT NULL,
  status ENUM('CALCULATED','ELIGIBLE','SELECTED') NOT NULL DEFAULT 'CALCULATED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY (sale_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_matching_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_code VARCHAR(50) NOT NULL UNIQUE,
  sale_id BIGINT UNSIGNED NOT NULL,
  activation_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NOT NULL,
  sponsor_id INT UNSIGNED NULL,
  placement_parent_id INT UNSIGNED NULL,
  event_number TINYINT UNSIGNED NULL,
  enrollment_bill DECIMAL(14,6) NOT NULL DEFAULT 0,
  binary_bill DECIMAL(14,6) NOT NULL DEFAULT 0,
  selected_bill DECIMAL(14,6) NOT NULL DEFAULT 0,
  selected_type ENUM('ENROLLMENT','BINARY') NULL,
  calculated_payout DECIMAL(14,6) NOT NULL DEFAULT 0,
  actual_payout DECIMAL(14,6) NOT NULL DEFAULT 0,
  reserve_before DECIMAL(14,6) NOT NULL DEFAULT 0,
  reserve_after DECIMAL(14,6) NOT NULL DEFAULT 0,
  daily_before DECIMAL(14,6) NOT NULL DEFAULT 0,
  daily_after DECIMAL(14,6) NOT NULL DEFAULT 0,
  payout_status ENUM('PENDING','PAID','REJECTED','REVERSED','ADJUSTED','FLUSHED') NOT NULL DEFAULT 'PENDING',
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sale_event_beneficiary (sale_id, event_number, beneficiary_id),
  KEY (beneficiary_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_daily_caps (
  user_id INT UNSIGNED NOT NULL,
  cap_date DATE NOT NULL,
  paid DECIMAL(14,6) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, cap_date)
) ENGINE=InnoDB;

-- One ledger table, strictly separated by ledger_type; balances are computed per type.
CREATE TABLE IF NOT EXISTS lo_ledger (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payout_code VARCHAR(60) NOT NULL UNIQUE,      -- idempotency key
  user_id INT UNSIGNED NOT NULL,
  ledger_type ENUM('CASHBACK','REFERRAL','MATCHING','GENERATION','RANK','ADJUSTMENT','WITHDRAW') NOT NULL,
  amount DECIMAL(14,6) NOT NULL,                 -- negative for debits/reversals
  activation_id BIGINT UNSIGNED NULL,
  sale_id BIGINT UNSIGNED NULL,
  ref_id BIGINT UNSIGNED NULL,
  level TINYINT UNSIGNED NULL,
  status ENUM('PENDING','PAID','REJECTED','REVERSED','ADJUSTED') NOT NULL DEFAULT 'PAID',
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY (user_id, ledger_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_pools (
  pool VARCHAR(30) PRIMARY KEY,         -- RANK, GENERATION_UNPAID, MATCHING_BUFFER, REFERRAL_UNPAID
  balance DECIMAL(16,6) NOT NULL DEFAULT 0
) ENGINE=InnoDB;
INSERT IGNORE INTO lo_pools (pool) VALUES ('RANK'),('GENERATION_UNPAID'),('MATCHING_BUFFER'),('REFERRAL_UNPAID');

CREATE TABLE IF NOT EXISTS lo_ranks (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  required_matchings INT UNSIGNED NOT NULL
) ENGINE=InnoDB;
-- Thresholds from the marketing plan; 1,000 is labelled "Gold/Executive" in the plan — confirm the final name.
INSERT IGNORE INTO lo_ranks VALUES
 (1,'Member',0),(2,'Silver Executive',100),(3,'Gold Executive',300),(4,'Gold/Executive',1000),
 (5,'Platinum Executive',5000),(6,'Diamond Executive',25000),(7,'Crown Executive',125000),
 (8,'Ambassador',500000),(9,'Global Ambassador',1500000);

CREATE TABLE IF NOT EXISTS lo_user_ranks (
  user_id INT UNSIGNED NOT NULL,
  rank_id TINYINT UNSIGNED NOT NULL,
  achieved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, rank_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_settings (
  k VARCHAR(60) PRIMARY KEY,
  v VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO lo_settings VALUES
 ('matching_paused','0'),('daily_matching_cap','5000'),('withdraw_min','500'),('withdraw_charge_pct','0');

CREATE TABLE IF NOT EXISTS lo_withdrawals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  method VARCHAR(40) NOT NULL,
  account_number VARCHAR(80) NOT NULL,
  amount DECIMAL(14,3) NOT NULL,
  charge DECIMAL(14,3) NOT NULL DEFAULT 0,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  admin_note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lo_master_audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(60) NOT NULL,
  target VARCHAR(255) NULL,
  ip VARCHAR(45) NOT NULL,
  ok TINYINT(1) NOT NULL,
  detail TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
