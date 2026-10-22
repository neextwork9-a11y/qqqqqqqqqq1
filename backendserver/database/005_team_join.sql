-- Additive referral joining fields; preserve existing accounts and trees.
ALTER TABLE users ADD COLUMN username VARCHAR(40) NULL;
CREATE UNIQUE INDEX lo_users_username ON users (username);
ALTER TABLE user_profiles ADD COLUMN district VARCHAR(60) NULL;
ALTER TABLE user_profiles ADD COLUMN post_code VARCHAR(12) NULL;
CREATE TABLE IF NOT EXISTS lo_placement_lock (
  id TINYINT PRIMARY KEY
) ENGINE=InnoDB;
INSERT IGNORE INTO lo_placement_lock (id) VALUES (1);